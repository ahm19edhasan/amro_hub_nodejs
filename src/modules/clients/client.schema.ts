import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().trim().min(2, "Name is too short"),
    phoneNumber: z.string().trim().min(7).optional(),
    email: z.string().trim().email().transform((v) => v.toLowerCase()).optional(),
    balance: z.coerce.number().min(0).optional().default(0),
    notes: z.string().trim().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;