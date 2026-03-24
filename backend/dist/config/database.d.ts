/**
 * MongoDB connection setup with lifecycle management.
 *
 * Why: Isolates database concerns from the server entrypoint so that
 * connection logic, error handling, and graceful disconnect live in
 * one place. The server must await `connectDB()` before listening.
 */
/**
 * Opens a connection to MongoDB and attaches lifecycle event loggers.
 *
 * Throws on failure so the caller can decide whether to retry or exit.
 */
export declare function connectDB(): Promise<void>;
/**
 * Gracefully closes the MongoDB connection.
 *
 * Why: Called during shutdown so in-flight operations finish
 * before the process exits, preventing data corruption.
 */
export declare function disconnectDB(): Promise<void>;
