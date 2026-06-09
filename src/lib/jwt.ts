import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

export const authSubjectSchema = z.enum(["admin", "user"]);
const tokenPayloadSchema = z.object({
    sub: z.string(),
    type: authSubjectSchema,
});

export type AuthSubjectType = z.infer<typeof authSubjectSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export const signAccessToken = (payload: TokenPayload): string =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

const parsePayload = (decoded: unknown): TokenPayload => {
    const result = tokenPayloadSchema.safeParse(decoded);
    if (!result.success) {
        throw AppError.unauthorized("Invalid token", "INVALID_TOKEN");
    }
    return result.data;
};

export const getTokenExpiry = (token: string): Date => {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) throw AppError.unauthorized("Invalid token", "INVALID_TOKEN");
    return new Date(decoded.exp * 1000);
};

export const verifyAccessToken = (token: string): TokenPayload =>
    parsePayload(jwt.verify(token, env.JWT_ACCESS_SECRET));

export const verifyRefreshToken = (token: string): TokenPayload =>
    parsePayload(jwt.verify(token, env.JWT_REFRESH_SECRET));