"use strict";
/**
 * Environment variable validation and typed config export.
 *
 * Why: Validates all required env vars at import time so the server
 * fails fast with a clear message instead of crashing mid-request
 * with an unhelpful "Cannot read properties of undefined" error.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
/** List of env vars that must be set before the server can start. */
const REQUIRED_VARS = [
    "MONGO_URI",
    "VAPID_EMAIL",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "FRONTEND_URL",
];
/**
 * Checks that every required variable exists in `process.env`.
 * Throws with a list of all missing vars (not just the first one).
 */
function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
            `Copy .env.example to .env and fill in all values.`);
    }
    return {
        PORT: parseInt(process.env.PORT ?? "5000", 10),
        MONGO_URI: process.env.MONGO_URI,
        VAPID_EMAIL: process.env.VAPID_EMAIL,
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
        FRONTEND_URL: process.env.FRONTEND_URL,
    };
}
/** Validated, typed environment config. Importable from any module. */
exports.env = validateEnv();
//# sourceMappingURL=env.js.map