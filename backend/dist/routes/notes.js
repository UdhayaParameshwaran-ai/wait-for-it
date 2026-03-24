"use strict";
/**
 * Note CRUD routes.
 *
 * Why separated: Keeps route definitions isolated from server setup,
 * middleware config, and model definitions. Each route file owns one
 * resource, making it easy to find and modify endpoint behavior.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteRouter = void 0;
const express_1 = require("express");
const Note_js_1 = require("../models/Note.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const validate_js_1 = require("../middleware/validate.js");
exports.noteRouter = (0, express_1.Router)();
/**
 * POST /api/notes — Create a new encrypted note.
 *
 * Accepts sender, receiver, encrypted message, IV, and reveal date.
 * Returns the MongoDB document ID so the frontend can build the share link.
 */
exports.noteRouter.post("/", async (req, res, next) => {
    try {
        const data = (0, validate_js_1.validateCreateNote)(req.body);
        const note = new Note_js_1.Note({
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            iv: data.iv,
            revealDate: new Date(data.revealDate),
        });
        await note.save();
        res.status(201).json({ id: note._id });
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /api/notes/:id — Retrieve a note by its ID.
 *
 * Why the reveal-date check: The encrypted message is only returned
 * after the reveal date has passed. Before that, the client gets a
 * placeholder string. This is the core "time-lock" mechanic.
 *
 * Note: The server never has the decryption key — the ciphertext is
 * returned as-is and decrypted client-side.
 */
exports.noteRouter.get("/:id", async (req, res, next) => {
    try {
        (0, validate_js_1.validateObjectId)(req.params.id);
        const note = await Note_js_1.Note.findById(req.params.id);
        if (!note) {
            throw new errorHandler_js_1.AppError("Note not found.", 404);
        }
        const isRevealed = new Date() >= note.revealDate;
        const response = {
            sender: note.sender,
            receiver: note.receiver,
            message: isRevealed
                ? note.message
                : "You have to wait for it. The message is still hidden!",
            iv: note.iv,
            revealDate: note.revealDate.toISOString(),
            isRevealed,
        };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=notes.js.map