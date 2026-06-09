import dayjs from "dayjs";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "./subscription.schema.js";

const INCLUDE = { user: true, plan: true } as const;

interface ListParams { skip: number; limit: number; userId?: string; status?: "active" | "expired"; }

export const listSubscriptions = async ({ skip, limit, userId, status }: ListParams) => {
    const where = {
        deletedAt: null,
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
    };
    const [items, total] = await Promise.all([
        prisma.subscription.findMany({ where, include: INCLUDE, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.subscription.count({ where }),
    ]);
    return { items, total };
};

export const getSubscriptionById = async (id: string) => {
    const sub = await prisma.subscription.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
    if (!sub) throw AppError.notFound("Subscription not found", "RESOURCE_NOT_FOUND");
    return sub;
};

export const createSubscription = async (data: CreateSubscriptionInput) => {
    const user = await prisma.user.findFirst({ where: { id: data.userId, deletedAt: null } });
    if (!user) throw AppError.notFound("User not found", "RESOURCE_NOT_FOUND");

    const active = await prisma.subscription.findFirst({
        where: { userId: data.userId, status: "active", deletedAt: null },
    });
    if (active) throw AppError.conflict("User already has an active subscription", "DUPLICATE_RECORD");

    let { endDate, price, originalPrice } = data;
    if (data.planId) {
        const plan = await prisma.plan.findFirst({ where: { id: data.planId, deletedAt: null } });
        if (!plan) throw AppError.notFound("Plan not found", "RESOURCE_NOT_FOUND");
        if (!endDate)       endDate = dayjs(data.startDate).add(plan.durationDays, "day").toDate();
        if (originalPrice == null) originalPrice = Number(plan.price);
        if (price == null)         price = Number(plan.price) - (data.discount ?? 0);
    }

    return prisma.subscription.create({
        data: {
            userId: data.userId, planId: data.planId,
            price, originalPrice, discount: data.discount,
            startDate: data.startDate, endDate, notes: data.notes,
            status: "active",
        },
        include: INCLUDE,
    });
};

export const updateSubscription = async (id: string, data: UpdateSubscriptionInput) => {
    await getSubscriptionById(id);
    return prisma.subscription.update({ where: { id }, data, include: INCLUDE });
};

export const expireSubscription = async (id: string) => {
    await getSubscriptionById(id);
    return prisma.subscription.update({
        where: { id },
        data: { status: "expired", endDate: new Date() },
        include: INCLUDE,
    });
};

export const deleteSubscription = async (id: string) => {
    await getSubscriptionById(id);
    return prisma.subscription.update({ where: { id }, data: { deletedAt: new Date() } });
};