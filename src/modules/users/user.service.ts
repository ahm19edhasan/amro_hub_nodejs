import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { hashPassword } from "../../lib/password.js";
import type { CreateUserInput, UpdateUserInput } from "./user.schema.js";

interface ListParams { skip: number; limit: number; search?: string; }

export const listUsers = async ({ skip, limit, search }: ListParams) => {
    const where = {
        deletedAt: null,
        ...(search
            ? { OR: [
                    { name:        { contains: search, mode: "insensitive" as const } },
                    { email:       { contains: search, mode: "insensitive" as const } },
                    { phoneNumber: { contains: search } },
                ] }
            : {}),
    };
    const [items, total] = await Promise.all([
        prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.user.count({ where }),
    ]);
    return { items, total };
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw AppError.notFound("User not found", "RESOURCE_NOT_FOUND");
    return user;
};

export const createUser = async (data: CreateUserInput) => {
    const { password, ...rest } = data;
    try {
        return await prisma.user.create({
            data: { ...rest, hashedPassword: await hashPassword(password) },
        });
    } catch (err) {
        // Prisma P2002: unique constraint
        if ((err as { code?: string }).code === "P2002") {
            throw AppError.conflict("Email or phone already exists", "DUPLICATE_RECORD");
        }
        throw err;
    }
};

export const updateUser = async (id: string, data: UpdateUserInput) => {
    await getUserById(id);
    try {
        return await prisma.user.update({ where: { id }, data });
    } catch (err) {
        if ((err as { code?: string }).code === "P2002") {
            throw AppError.conflict("Email or phone already exists", "DUPLICATE_RECORD");
        }
        throw err;
    }
};

export const deleteUser = async (id: string) => {
    await getUserById(id);
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const changeUserStatus = async (id: string) => {
    const user = await getUserById(id);
    const isActive = !user.isActive;
    return prisma.user.update({ where: { id }, data: { isActive } });
};
