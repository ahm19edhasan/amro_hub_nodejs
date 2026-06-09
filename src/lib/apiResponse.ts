import type { Response } from "express";

const SENSITIVE = new Set(["hashedPassword", "hashed_password", "tokenHash", "token_hash"]);

const sanitize = (data: unknown): unknown => {
    if (data === null || typeof data !== "object") return data;
    if (data instanceof Date) return data;
    if (Array.isArray(data)) return data.map(sanitize);
    return Object.fromEntries(
        Object.entries(data as Record<string, unknown>)
            .filter(([key]) => !SENSITIVE.has(key))
            .map(([key, value]) => [key, sanitize(value)]),
    );
};

interface SuccessOptions {
    status?: boolean;
    statusCode?: number;
    message?: string;
    data?: unknown;
    meta?: Record<string, unknown> | null;
}

export const sendSuccess = (res: Response, opts: SuccessOptions = {}) => {
    const { status = true, statusCode = 200, message = "Success", data = null, meta = null } = opts;

    const body: Record<string, unknown> = {
        message,
        code: statusCode,
        status,
        data: sanitize(data),
        // timestamp: new Date().toISOString(),
    };

    if (meta != null) body.meta = meta;

    return res.status(statusCode).json(body);
};

export const sendCreated = (res: Response, opts: SuccessOptions = {}) =>
    sendSuccess(res, { statusCode: 201, message: "Created successfully", ...opts });

interface ErrorOptions {
    status?: boolean;
    statusCode?: number;
    message?: string;
    details?: unknown;
}

export const sendError = (res: Response, opts: ErrorOptions = {}) => {
    const { statusCode = 500, message = "Error", details = null } = opts;
    const body: Record<string, unknown> = {
        status: false,
        code: statusCode,
        message,
        data: null,
    };
    if (details != null) body.details = details;
    return res.status(statusCode).json(body);
};