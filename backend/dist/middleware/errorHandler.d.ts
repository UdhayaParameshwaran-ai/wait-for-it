/**
 * Global Express error-handling middleware.
 *
 * Why: Without a centralized error handler, unhandled errors in route
 * handlers crash the process or return raw stack traces to clients.
 * This middleware catches everything, logs the full error server-side,
 * and returns a safe JSON response to the client.
 */
import type { Request, Response, NextFunction } from "express";
/**
 * Custom error class that carries an HTTP status code.
 *
 * Why: Allows route handlers to throw meaningful errors
 * (e.g., `throw new AppError("Not found", 404)`) instead of
 * manually calling `res.status().json()` in every catch block.
 */
export declare class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
/**
 * Express error-handling middleware (must have 4 parameters).
 *
 * Distinguishes between known AppErrors (returns the intended status)
 * and unexpected errors (always returns 500 to avoid leaking internals).
 */
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
