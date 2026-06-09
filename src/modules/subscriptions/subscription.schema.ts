import { z } from "zod";

export const createSubscriptionSchema = z.object({
    userId: z.uuid("Invalid user id"),
    planId: z.uuid("Invalid plan id").optional(),
    price: z.coerce.number().min(0).optional(),
    originalPrice: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional().default(0),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    notes: z.string().trim().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial().omit({ userId: true });

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;