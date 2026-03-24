"use strict";
/**
 * MongoDB connection setup with lifecycle management.
 *
 * Why: Isolates database concerns from the server entrypoint so that
 * connection logic, error handling, and graceful disconnect live in
 * one place. The server must await `connectDB()` before listening.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
/**
 * Opens a connection to MongoDB and attaches lifecycle event loggers.
 *
 * Throws on failure so the caller can decide whether to retry or exit.
 */
async function connectDB() {
    mongoose_1.default.connection.on("connected", () => {
        console.log("[db] Connected to MongoDB");
    });
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("[db] MongoDB disconnected");
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.error("[db] MongoDB connection error:", err);
    });
    await mongoose_1.default.connect(env_js_1.env.MONGO_URI);
}
/**
 * Gracefully closes the MongoDB connection.
 *
 * Why: Called during shutdown so in-flight operations finish
 * before the process exits, preventing data corruption.
 */
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    console.log("[db] MongoDB connection closed");
}
//# sourceMappingURL=database.js.map