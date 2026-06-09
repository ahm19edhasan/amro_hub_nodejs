import type { Admin } from "../../generated/prisma/client.js";

export const serializeAdmin = (admin: Admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phoneNumber: admin.phoneNumber,
    permissions: admin.permissions,
    role: "admin" as const,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
});