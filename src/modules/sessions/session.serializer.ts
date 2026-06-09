import type { Session, Client } from "../../generated/prisma/client.js";
type SessionWithClient = Session & { client?: Client | null };

export const serializeSession = (s: SessionWithClient) => ({
    id: s.id,
    clientId: s.clientId,
    entryTime: s.entryTime,
    exitTime: s.exitTime,
    durationMinutes: s.durationMinutes,
    hourlyRate: s.hourlyRate !== null ? Number(s.hourlyRate) : null,
    freeHours: s.freeHours !== null ? Number(s.freeHours) : null,
    totalCost: s.totalCost !== null ? Number(s.totalCost) : null,
    notes: s.notes,
    status: s.exitTime ? "finished" : "active",
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    client: s.client ? { id: s.client.id, name: s.client.name, phoneNumber: s.client.phoneNumber } : undefined,
});