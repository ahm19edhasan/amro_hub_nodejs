import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError.js";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (req.auth?.type !== "admin") {
        throw AppError.forbidden("Admin access required", "FORBIDDEN");
    }
    next();
};