export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details: unknown;
    public readonly isOperational = true;

    constructor(message: string, statusCode = 500, code = "ERROR", details: unknown = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }

    static badRequest(message = "Bad request", code = "BAD_REQUEST", details?: unknown) {
        return new AppError(message, 400, code, details);
    }
    static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
        return new AppError(message, 401, code);
    }
    static forbidden(message = "Forbidden", code = "FORBIDDEN") {
        return new AppError(message, 403, code);
    }
    static notFound(message = "Resource not found", code = "RESOURCE_NOT_FOUND") {
        return new AppError(message, 404, code);
    }
    static conflict(message = "Already exists", code = "DUPLICATE_RECORD", details?: unknown) {
        return new AppError(message, 409, code, details);
    }
}