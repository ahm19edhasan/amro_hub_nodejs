import type { Plan } from "../../generated/prisma/client.js";

export const serializePlan = (plan: Plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price), // Decimal → number
    durationDays: plan.durationDays,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
});