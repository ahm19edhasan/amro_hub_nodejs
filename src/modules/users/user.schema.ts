import { z } from "zod";

const universityEnum = z
    .enum(["islamic_university", "al-azhar_university", "freelancer"])
    .transform((v) => (v === "al-azhar_university" ? ("al_azhar_university" as const) : v));

export const createUserSchema = z.object({
    name: z.string().trim().min(2, "Name is too short"),
    email: z.string().trim().email().transform((v) => v.toLowerCase()),
    phoneNumber: z.string().trim().min(7, "Phone number is too short"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    university: universityEnum.optional(),
    balance: z.coerce.number().optional().default(0),
    notes: z.string().trim().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;