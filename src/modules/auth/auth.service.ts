import { prisma } from "../../config/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { verifyPassword } from "../../lib/password.js";
import { signAccessToken, signRefreshToken, getTokenExpiry, verifyRefreshToken, type TokenPayload } from "../../lib/jwt.js";
import { sha256 } from "../../lib/tokens.js";
import { serializeAdmin } from "./auth.serializer.js";

interface LoginContext {
    ip?: string;
    userAgent?: string;
}

export const loginAdmin = async (email: string, password: string, ctx: LoginContext) => {
    const admin = await prisma.admin.findFirst({ where: { email, deletedAt: null } });
    if (!admin) throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");

    const valid = await verifyPassword(password, admin.hashedPassword);
    if (!valid) throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");

    const payload = { sub: admin.id, type: "admin" as const };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = getTokenExpiry(refreshToken);

    await prisma.refreshToken.create({
        data: {
            subjectType: "admin",
            subjectId: admin.id,
            tokenHash: sha256(refreshToken),
            expiresAt,
            userAgent: ctx.userAgent,
            ipAddress: ctx.ip,
        },
    });

    return { admin, accessToken, refreshToken, expiresAt };
};

export const getCurrentUser = async (payload: TokenPayload) => {
    if (payload.type === "admin") {
        const admin = await prisma.admin.findFirst({ where: { id: payload.sub, deletedAt: null } });
        if (!admin) throw AppError.unauthorized("Account not found", "UNAUTHORIZED");
        return serializeAdmin(admin);
    }
    throw AppError.unauthorized("Unsupported subject", "UNAUTHORIZED"); // User لاحقاً
};

export const refreshTokens = async (refreshToken: string, ctx: LoginContext) => {
    verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored) throw AppError.unauthorized("Invalid refresh token", "SESSION_REVOKED");

    if (stored.revokedAt) {
        await prisma.refreshToken.updateMany({
            where: { subjectType: stored.subjectType, subjectId: stored.subjectId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        throw AppError.unauthorized("Refresh token reuse detected", "SESSION_REVOKED");
    }

    if (stored.expiresAt < new Date()) throw AppError.unauthorized("Refresh token expired", "SESSION_EXPIRED");

    const newPayload = { sub: stored.subjectId, type: stored.subjectType };
    const accessToken = signAccessToken(newPayload);
    const newRefresh = signRefreshToken(newPayload);
    const expiresAt = getTokenExpiry(newRefresh);

    await prisma.$transaction(async (tx) => {
        const created = await tx.refreshToken.create({
            data: {
                subjectType: stored.subjectType,
                subjectId: stored.subjectId,
                tokenHash: sha256(newRefresh),
                expiresAt,
                userAgent: ctx.userAgent,
                ipAddress: ctx.ip,
            },
        });
        await tx.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date(), replacedById: created.id },
        });
    });

    return { accessToken, refreshToken: newRefresh, expiresAt };
};

export const logoutUser = async(refreshToken?: string) => {
    if (!refreshToken) return;
    await prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
    });
}