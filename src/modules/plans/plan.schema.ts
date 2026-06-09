import { z } from "zod";

export const createPlanSchema = z.object({
    name: z.string().trim().min(2, "Name is too short"),
    description: z.string().trim().optional(),
    price: z.coerce.number().min(0, "Price must be ≥ 0"),
    durationDays: z.coerce.number().int().positive("Duration must be a positive integer"),
    isActive: z.boolean().optional().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;