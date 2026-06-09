import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import type { CreateClientInput, UpdateClientInput } from "./client.schema.js";

interface ListParams { skip: number; limit: number; search?: string; }

export const listClients = async ({ skip, limit, search }: ListParams) => {
    const where = {
        deletedAt: null,
        ...(search
            ? { OR: [
                    { name:        { contains: search, mode: "insensitive" as const } },
                    { phoneNumber: { contains: search } },
                ] }
            : {}),
    };
    const [items, total] = await Promise.all([
        prisma.client.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.client.count({ where }),
    ]);
    return { items, total };
};

export const getClientById = async (id: string) => {
    const client = await prisma.client.findFirst({ where: { id, deletedAt: null } });
    if (!client) throw AppError.notFound("Client not found", "RESOURCE_NOT_FOUND");
    return client;
};

export const createClient = async (data: CreateClientInput) => {
    try {
        return await prisma.client.create({ data });
    } catch (err) {
        if ((err as { code?: string }).code === "P2002") {
            throw AppError.conflict("Phone number already exists", "DUPLICATE_RECORD");
        }
        throw err;
    }
};

export const updateClient = async (id: string, data: UpdateClientInput) => {
    await getClientById(id);
    try {
        return await prisma.client.update({ where: { id }, data });
    } catch (err) {
        if ((err as { code?: string }).code === "P2002") {
            throw AppError.conflict("Phone number already exists", "DUPLICATE_RECORD");
        }
        throw err;
    }
};

export const deleteClient = async (id: string) => {
    await getClientById(id);
    return prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const changeClientStatus = async (id: string) => {
    const client = await getClientById(id);
    const isActive = !client.isActive;
    return prisma.client.update({ where: { id }, data: { isActive } });
};