import { z } from "zod";
export const startSessionSchema = z.object({
    clientId: z.uuid("Invalid client id"),
    entryTime: z.coerce.date().optional(),
    notes: z.string().trim().optional(),
});
export const endSessionSchema = z.object({
    exitTime: z.coerce.date().refine((d) => d.getTime() <= Date.now(), "Entry time cannot be in the future").optional(),
});