/**
 * Request validation helpers for route handlers.
 *
 * Why: Moves validation logic out of route handlers into reusable
 * functions. Each validator throws an AppError with a 400 status
 * so the global error handler returns a consistent JSON response.
 */

import mongoose from "mongoose";
import { AppError } from "./errorHandler.js";
import type { CreateNoteRequest, SubscribeRequest } from "../types/index.js";

/**
 * Validates that a date string parses into a valid Date object.
 *
 * Why: `new Date("garbage")` returns Invalid Date silently.
 * We need to catch this before saving to MongoDB.
 */
function isValidDate(value: string): boolean {
  return !isNaN(new Date(value).getTime());
}

/**
 * Validates that a string is a syntactically valid MongoDB ObjectId.
 *
 * Why: Passing a malformed ID to `findById` throws a CastError.
 * Validating upfront gives the client a clear 400 instead of a 500.
 */
export function validateObjectId(id: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid note ID format.", 400);
  }
}

/**
 * Validates the request body for creating a new note.
 *
 * Checks: all required fields present, correct types, valid date,
 * and reasonable length limits.
 */
export function validateCreateNote(body: unknown): CreateNoteRequest {
  const { sender, receiver, message, iv, revealDate } = body as Record<
    string,
    unknown
  >;

  if (!sender || !receiver || !message || !revealDate) {
    throw new AppError("All fields are required (sender, receiver, message, revealDate).", 400);
  }

  if (
    typeof sender !== "string" ||
    typeof receiver !== "string" ||
    typeof message !== "string"
  ) {
    throw new AppError("Sender, receiver, and message must be strings.", 400);
  }

  if (sender.length > 100 || receiver.length > 100) {
    throw new AppError("Sender and receiver must be 100 characters or fewer.", 400);
  }

  if (message.length > 50000) {
    throw new AppError("Message must be 50,000 characters or fewer.", 400);
  }

  if (typeof revealDate !== "string" || !isValidDate(revealDate)) {
    throw new AppError("Invalid revealDate format.", 400);
  }

  return {
    sender: sender as string,
    receiver: receiver as string,
    message: message as string,
    iv: typeof iv === "string" ? iv : "",
    revealDate: revealDate as string,
  };
}

/**
 * Validates the request body for subscribing to push notifications.
 *
 * Checks: subscription object shape, required fields, valid noteId.
 */
export function validateSubscription(body: unknown): SubscribeRequest {
  const { subscription, userId, noteId, revealDate } = body as Record<
    string,
    unknown
  >;

  if (!subscription || !userId || !noteId || !revealDate) {
    throw new AppError(
      "All fields are required (subscription, userId, noteId, revealDate).",
      400
    );
  }

  if (typeof userId !== "string" || typeof noteId !== "string") {
    throw new AppError("userId and noteId must be strings.", 400);
  }

  validateObjectId(noteId);

  const sub = subscription as Record<string, unknown>;
  if (!sub.endpoint || !sub.keys) {
    throw new AppError("Invalid push subscription object.", 400);
  }

  if (typeof revealDate !== "string" || !isValidDate(revealDate)) {
    throw new AppError("Invalid revealDate format.", 400);
  }

  return body as SubscribeRequest;
}
