"use strict";
/**
 * Global Express error-handling middleware.
 *
 * Why: Without a centralized error handler, unhandled errors in route
 * handlers crash the process or return raw stack traces to clients.
 * This middleware catches everything, logs the full error server-side,
 * and returns a safe JSON response to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
/**
 * Custom error class that carries an HTTP status code.
 *
 * Why: Allows route handlers to throw meaningful errors
 * (e.g., `throw new AppError("Not found", 404)`) instead of
 * manually calling `res.status().json()` in every catch block.
 */
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
/**
 * Express error-handling middleware (must have 4 parameters).
 *
 * Distinguishes between known AppErrors (returns the intended status)
 * and unexpected errors (always returns 500 to avoid leaking internals).
 */
function errorHandler(err, _req, res, _next) {
    console.error(`[error] ${err.name}: ${err.message}`, err.stack);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: "Internal server error." });
}
//# sourceMappingURL=errorHandler.js.map