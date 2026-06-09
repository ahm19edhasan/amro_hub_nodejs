import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../lib/AppError.js";

export const validate =
    (schema: ZodType) =>
        (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return next(
                    AppError.badRequest(
                        "Validation failed",
                        "VALIDATION_ERROR",
                        result.error.issues.map((i) => ({
                            field: i.path.join("."),
                            message: i.message,
                        })),
                    ),
                );
            }
            req.body = result.data;
            next();
        };