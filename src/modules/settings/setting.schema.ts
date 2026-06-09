import { z } from "zod";
export const updateSettingSchema = z.object({
    value: z.string(),
    description: z.string().optional(),
});
export const keyParamSchema = z.object({ key: z.string().min(1) });