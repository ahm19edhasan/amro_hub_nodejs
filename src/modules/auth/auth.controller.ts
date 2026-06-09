import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/apiResponse.js";
import { loginAdmin, getCurrentUser, refreshTokens, logoutUser } from "./auth.service.js";
import { serializeAdmin } from "./auth.serializer.js";
import { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie } from "./auth.cookie.js";
import { AppError } from "../../lib/AppError.js";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };

    const { admin, accessToken, refreshToken, expiresAt } = await loginAdmin(email, password, {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
    });

    setRefreshCookie(res, refreshToken, expiresAt);

    return sendSuccess(res, {
        message: "Logged in successfully",
        data: { user: serializeAdmin(admin), access_token: accessToken },
    });
};

export const me = async (req: Request, res: Response) => {
    const user = await getCurrentUser(req.auth!);
    return sendSuccess(res, { data: user });
};

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) throw AppError.unauthorized("Refresh token missing", "UNAUTHORIZED");

    const { accessToken, refreshToken, expiresAt } = await refreshTokens(token, {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
    });
    setRefreshCookie(res, refreshToken, expiresAt);
    return sendSuccess(res, { message: "Token refreshed", data: { token: accessToken } });
};

export const logout = async (req: Request, res: Response) => {
    await logoutUser(req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined);
    clearRefreshCookie(res);
    return sendSuccess(res, { message: "Logged out successfully" });
};