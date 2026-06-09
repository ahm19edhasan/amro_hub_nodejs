import type { Client } from "../../generated/prisma/client.js";

export const serializeClient = (c: Client) => ({
    id: c.id,
    name: c.name,
    phoneNumber: c.phoneNumber,
    email: c.email,
    balance: Number(c.balance),
    notes: c.notes,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
});