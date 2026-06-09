import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { getSettingNumber } from "../settings/settings.service.js";

const INCLUDE = { client: true } as const;

interface ListParams { skip: number; limit: number; clientId?: string; status?: "active" | "finished"; }

export const listSessions = async ({ skip, limit, clientId, status }: ListParams) => {
    const where = {
        deletedAt: null,
        ...(clientId ? { clientId } : {}),
        ...(status === "active" ? { exitTime: null } :
            status === "finished" ? { exitTime: { not: null } } : {}),
    };
    const [items, total] = await Promise.all([
        prisma.session.findMany({ where, include: INCLUDE, orderBy: { entryTime: "desc" }, skip, take: limit }),
        prisma.session.count({ where }),
    ]);
    return { items, total };
};

export const getSessionById = async (id: string) => {
    const s = await prisma.session.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
    if (!s) throw AppError.notFound("Session not found", "RESOURCE_NOT_FOUND");
    return s;
};

export const startSession = async (data: { clientId: string; entryTime?: Date; notes?: string }) => {
    const client = await prisma.client.findFirst({ where: { id: data.clientId, deletedAt: null } });
    if (!client) throw AppError.notFound("Client not found", "RESOURCE_NOT_FOUND");

    const active = await prisma.session.findFirst({
        where: { clientId: data.clientId, exitTime: null, deletedAt: null },
    });
    if (active) throw AppError.conflict("Client already has an active session", "ALREADY_IN_ACTIVE_SESSION");

    return prisma.session.create({
        data: { clientId: data.clientId, entryTime: data.entryTime ?? new Date(), notes: data.notes },
        include: INCLUDE,
    });
};

export const endSession = async (id: string, data: { exitTime?: Date }) => {
    const session = await prisma.session.findFirst({ where: { id, deletedAt: null } });
    if (!session) throw AppError.notFound("Session not found", "RESOURCE_NOT_FOUND");
    if (session.exitTime) throw AppError.badRequest("Session is already ended", "BAD_REQUEST");

    const exitTime = data.exitTime ?? new Date();
    if (exitTime.getTime() <= session.entryTime.getTime()) {
        console.log({
            "exit Time :" : exitTime.getTime(),
            "entry Time :" : session.entryTime.getTime()
        })

        throw AppError.badRequest("Exit time must be after entry time", "BAD_REQUEST");
    }

    const durationMinutes = Math.ceil((exitTime.getTime() - session.entryTime.getTime()) / 60000);

    const hourlyRate = await getSettingNumber("hourly_rate", 0);
    const freeHours  = await getSettingNumber("free_hours",  0);

    const hours = durationMinutes / 60;
    const billableHours = Math.max(0, hours - freeHours);
    const totalCost = Math.round(billableHours * hourlyRate * 100) / 100;

    return prisma.session.update({
        where: { id },
        data: { exitTime, durationMinutes, hourlyRate, freeHours, totalCost },
        include: INCLUDE,
    });
};

export const deleteSession = async (id: string) => {
    await getSessionById(id);
    return prisma.session.update({ where: { id }, data: { deletedAt: new Date() } });
};