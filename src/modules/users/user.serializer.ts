import type { User } from "../../generated/prisma/client.js";

export const serializeUser = (user: User) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    university:
        user.university === "al_azhar_university" ? "al-azhar_university" : user.university,
    balance: Number(user.balance),
    notes: user.notes,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});