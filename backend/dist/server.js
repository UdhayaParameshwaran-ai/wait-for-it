"use strict";
/**
 * Application entrypoint — assembles middleware, routes, and starts
 * the HTTP server only after the database connection is established.
 *
 * Why this structure: The original server.js started listening before
 * confirming the DB was reachable, causing all requests to fail
 * silently when MongoDB was down.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const web_push_1 = __importDefault(require("web-push"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const notes_js_1 = require("./routes/notes.js");
const subscription_js_1 = require("./routes/subscription.js");
const app = (0, express_1.default)();
// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
/**
 * Why explicit origin: The original `cors()` allowed every origin (*).
 * Restricting to the frontend URL prevents other websites from making
 * API requests on behalf of users.
 */
app.use((0, cors_1.default)({ origin: env_js_1.env.FRONTEND_URL }));
/**
 * Why the limit: Without a body size cap, a single request with a
 * massive payload can exhaust server memory.
 */
app.use(express_1.default.json({ limit: "10kb" }));
// ---------------------------------------------------------------------------
// Web Push configuration
// ---------------------------------------------------------------------------
web_push_1.default.setVapidDetails(`mailto:${env_js_1.env.VAPID_EMAIL}`, env_js_1.env.VAPID_PUBLIC_KEY, env_js_1.env.VAPID_PRIVATE_KEY);
// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
/** Health check — used by load balancers and monitoring. */
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/notes", notes_js_1.noteRouter);
app.use("/api/subscribe", subscription_js_1.subscriptionRouter);
// ---------------------------------------------------------------------------
// Global error handler (must be registered after all routes)
// ---------------------------------------------------------------------------
app.use(errorHandler_js_1.errorHandler);
// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
/**
 * Boots the server: connects to MongoDB first, then starts listening.
 *
 * Why async/await with process.exit: If the DB is unreachable the
 * server should fail fast instead of accepting requests it can't serve.
 */
async function start() {
    try {
        await (0, database_js_1.connectDB)();
        const server = app.listen(env_js_1.env.PORT, () => {
            console.log(`[server] Running on port ${env_js_1.env.PORT}`);
        });
        /**
         * Graceful shutdown handler.
         *
         * Why: During deploys (SIGTERM) or manual stops (SIGINT), the
         * server needs to finish in-flight requests and close the DB
         * connection cleanly to prevent data corruption.
         */
        const shutdown = async (signal) => {
            console.log(`[server] ${signal} received — shutting down`);
            server.close(async () => {
                await (0, database_js_1.disconnectDB)();
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }
    catch (err) {
        console.error("[server] Failed to start:", err);
        process.exit(1);
    }
}
/**
 * Catch-all for unhandled promise rejections.
 *
 * Why: Without this, an unhandled rejection in Node.js >=15
 * terminates the process with no useful error message.
 */
process.on("unhandledRejection", (reason) => {
    console.error("[server] Unhandled rejection:", reason);
});
start();
//# sourceMappingURL=server.js.map