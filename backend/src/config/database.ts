/**
 * MongoDB connection setup with lifecycle management.
 *
 * Why: Isolates database concerns from the server entrypoint so that
 * connection logic, error handling, and graceful disconnect live in
 * one place. The server must await `connectDB()` before listening.
 */

import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Opens a connection to MongoDB and attaches lifecycle event loggers.
 *
 * Throws on failure so the caller can decide whether to retry or exit.
 */
export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected", () => {
    console.log("[db] Connected to MongoDB");
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err);
  });

  await mongoose.connect(env.MONGO_URI);
}

/**
 * Gracefully closes the MongoDB connection.
 *
 * Why: Called during shutdown so in-flight operations finish
 * before the process exits, preventing data corruption.
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log("[db] MongoDB connection closed");
}
