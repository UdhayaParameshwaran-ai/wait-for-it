/**
 * Mongoose model for encrypted notes.
 *
 * Why: Defines the schema with explicit types so Mongoose queries
 * return typed documents and field constraints are enforced at the
 * database layer (not just in route handlers).
 */
import mongoose from "mongoose";
import type { INote } from "../types/index.js";
export declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}> & INote & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
