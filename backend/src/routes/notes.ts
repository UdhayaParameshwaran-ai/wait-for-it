/**
 * Note CRUD routes.
 *
 * Why separated: Keeps route definitions isolated from server setup,
 * middleware config, and model definitions. Each route file owns one
 * resource, making it easy to find and modify endpoint behavior.
 */

import { Router } from "express";
import { Note } from "../models/Note.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  validateCreateNote,
  validateObjectId,
} from "../middleware/validate.js";
import type { NoteResponse } from "../types/index.js";

export const noteRouter = Router();

/**
 * POST /api/notes — Create a new encrypted note.
 *
 * Accepts sender, receiver, encrypted message, IV, and reveal date.
 * Returns the MongoDB document ID so the frontend can build the share link.
 */
noteRouter.post("/", async (req, res, next) => {
  try {
    const data = validateCreateNote(req.body);

    const note = new Note({
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      iv: data.iv,
      revealDate: new Date(data.revealDate),
    });

    await note.save();
    res.status(201).json({ id: note._id });
  } catch (err) {
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
noteRouter.get("/:id", async (req, res, next) => {
  try {
    validateObjectId(req.params.id);

    const note = await Note.findById(req.params.id);
    if (!note) {
      throw new AppError("Note not found.", 404);
    }

    const isRevealed = new Date() >= note.revealDate;

    const response: NoteResponse = {
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
  } catch (err) {
    next(err);
  }
});
