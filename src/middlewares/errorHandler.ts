import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { AppError } from "../lib/AppError.js";
import { sendError } from "../lib/apiResponse.js";

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (err instanceof AppError) {
        return sendError(res, {
            statusCode: err.statusCode,
            message: err.message,
            code: err.code,
            details: err.details,
        });
    }
    if (err instanceof ZodError) {
        return sendError(res, {
            statusCode: 400,
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        });
    }
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
        return sendError(res, { statusCode: 401, message: "Invalid or expired token", code: "SESSION_EXPIRED" });
    }
    console.error(err);
    return sendError(res, { statusCode: 500, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
};