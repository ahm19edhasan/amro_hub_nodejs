import type { Response } from "express";
import { isProduction } from "../../config/env.js";

export const REFRESH_COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/api/auth";

export const setRefreshCookie = (res: Response, token: string, expiresAt: Date) => {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: COOKIE_PATH,
        expires: expiresAt,
    });
};

export const clearRefreshCookie = (res: Response) => {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: COOKIE_PATH });
};