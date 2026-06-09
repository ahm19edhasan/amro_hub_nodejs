import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError.js";
import { verifyAccessToken } from "../lib/jwt.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const header = req.get("authorization");
    if (!header?.startsWith("Bearer ")) {
        throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
    }
    req.auth = verifyAccessToken(header.slice(7).trim());
    next();
};