/**
 * Mongoose model for encrypted notes.
 *
 * Why: Defines the schema with explicit types so Mongoose queries
 * return typed documents and field constraints are enforced at the
 * database layer (not just in route handlers).
 */

import mongoose, { Schema } from "mongoose";
import type { INote } from "../types/index.js";

const noteSchema = new Schema<INote>(
  {
    sender: { type: String, required: true, maxlength: 100 },
    receiver: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 50000 },
    iv: { type: String, required: true },
    revealDate: { type: Date, required: true },
  },
  {
    /** Why timestamps: gives us createdAt/updatedAt for debugging without manual work. */
    timestamps: true,
  }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
