/**
 * Request validation helpers for route handlers.
 *
 * Why: Moves validation logic out of route handlers into reusable
 * functions. Each validator throws an AppError with a 400 status
 * so the global error handler returns a consistent JSON response.
 */
import type { CreateNoteRequest, SubscribeRequest } from "../types/index.js";
/**
 * Validates that a string is a syntactically valid MongoDB ObjectId.
 *
 * Why: Passing a malformed ID to `findById` throws a CastError.
 * Validating upfront gives the client a clear 400 instead of a 500.
 */
export declare function validateObjectId(id: string): void;
/**
 * Validates the request body for creating a new note.
 *
 * Checks: all required fields present, correct types, valid date,
 * and reasonable length limits.
 */
export declare function validateCreateNote(body: unknown): CreateNoteRequest;
/**
 * Validates the request body for subscribing to push notifications.
 *
 * Checks: subscription object shape, required fields, valid noteId.
 */
export declare function validateSubscription(body: unknown): SubscribeRequest;
