import type { Subscription, Plan, User } from "../../generated/prisma/client.js";

type SubWithRelations = Subscription & { user?: User | null; plan?: Plan | null };

export const serializeSubscription = (s: SubWithRelations) => ({
    id: s.id,
    userId: s.userId,
    planId: s.planId,
    price: s.price !== null ? Number(s.price) : null,
    originalPrice: s.originalPrice !== null ? Number(s.originalPrice) : null,
    discount: s.discount !== null ? Number(s.discount) : 0,
    startDate: s.startDate,
    endDate: s.endDate,
    status: s.status,
    notes: s.notes,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    user: s.user ? { id: s.user.id, name: s.user.name, email: s.user.email } : undefined,
    plan: s.plan ? { id: s.plan.id, name: s.plan.name, durationDays: s.plan.durationDays, price: Number(s.plan.price) } : undefined,
});