import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import type { CreatePlanInput, UpdatePlanInput } from "./plan.schema.js";

interface ListParams { skip: number; limit: number; search?: string; }

export const getAllPlans = async ({ skip, limit, search }: ListParams) => {
    const where = {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };
    const [items, total] = await Promise.all([
        prisma.plan.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.plan.count({ where }),
    ]);
    return { items, total };
};

export const getPlanById = async (id: string) => {
    const plan = await prisma.plan.findFirst({ where: { id, deletedAt: null } });
    if (!plan) throw AppError.notFound("Plan not found", "RESOURCE_NOT_FOUND");
    return plan;
};

export const createPlan = (data: CreatePlanInput) => prisma.plan.create({ data });

export const updatePlan = async (id: string, data: UpdatePlanInput) => {
    await getPlanById(id);
    return prisma.plan.update({ where: { id }, data });
};

export const deletePlan = async (id: string) => {
    await getPlanById(id);
    return prisma.plan.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const changePlanStatus = async (id: string) => {
    const plan = await getPlanById(id);
    const isActive = !plan.isActive;
    return prisma.plan.update({ where: { id }, data: { isActive } });
};