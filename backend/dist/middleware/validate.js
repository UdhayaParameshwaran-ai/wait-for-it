"use strict";
/**
 * Request validation helpers for route handlers.
 *
 * Why: Moves validation logic out of route handlers into reusable
 * functions. Each validator throws an AppError with a 400 status
 * so the global error handler returns a consistent JSON response.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = validateObjectId;
exports.validateCreateNote = validateCreateNote;
exports.validateSubscription = validateSubscription;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_js_1 = require("./errorHandler.js");
/**
 * Validates that a date string parses into a valid Date object.
 *
 * Why: `new Date("garbage")` returns Invalid Date silently.
 * We need to catch this before saving to MongoDB.
 */
function isValidDate(value) {
    return !isNaN(new Date(value).getTime());
}
/**
 * Validates that a string is a syntactically valid MongoDB ObjectId.
 *
 * Why: Passing a malformed ID to `findById` throws a CastError.
 * Validating upfront gives the client a clear 400 instead of a 500.
 */
function validateObjectId(id) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new errorHandler_js_1.AppError("Invalid note ID format.", 400);
    }
}
/**
 * Validates the request body for creating a new note.
 *
 * Checks: all required fields present, correct types, valid date,
 * and reasonable length limits.
 */
function validateCreateNote(body) {
    const { sender, receiver, message, iv, revealDate } = body;
    if (!sender || !receiver || !message || !revealDate) {
        throw new errorHandler_js_1.AppError("All fields are required (sender, receiver, message, revealDate).", 400);
    }
    if (typeof sender !== "string" ||
        typeof receiver !== "string" ||
        typeof message !== "string") {
        throw new errorHandler_js_1.AppError("Sender, receiver, and message must be strings.", 400);
    }
    if (sender.length > 100 || receiver.length > 100) {
        throw new errorHandler_js_1.AppError("Sender and receiver must be 100 characters or fewer.", 400);
    }
    if (message.length > 50000) {
        throw new errorHandler_js_1.AppError("Message must be 50,000 characters or fewer.", 400);
    }
    if (typeof revealDate !== "string" || !isValidDate(revealDate)) {
        throw new errorHandler_js_1.AppError("Invalid revealDate format.", 400);
    }
    return {
        sender: sender,
        receiver: receiver,
        message: message,
        iv: typeof iv === "string" ? iv : "",
        revealDate: revealDate,
    };
}
/**
 * Validates the request body for subscribing to push notifications.
 *
 * Checks: subscription object shape, required fields, valid noteId.
 */
function validateSubscription(body) {
    const { subscription, userId, noteId, revealDate } = body;
    if (!subscription || !userId || !noteId || !revealDate) {
        throw new errorHandler_js_1.AppError("All fields are required (subscription, userId, noteId, revealDate).", 400);
    }
    if (typeof userId !== "string" || typeof noteId !== "string") {
        throw new errorHandler_js_1.AppError("userId and noteId must be strings.", 400);
    }
    validateObjectId(noteId);
    const sub = subscription;
    if (!sub.endpoint || !sub.keys) {
        throw new errorHandler_js_1.AppError("Invalid push subscription object.", 400);
    }
    if (typeof revealDate !== "string" || !isValidDate(revealDate)) {
        throw new errorHandler_js_1.AppError("Invalid revealDate format.", 400);
    }
    return body;
}
//# sourceMappingURL=validate.js.map