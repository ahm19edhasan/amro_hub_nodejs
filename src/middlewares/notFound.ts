import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError.js";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
};