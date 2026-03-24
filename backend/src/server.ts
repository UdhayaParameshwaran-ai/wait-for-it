/**
 * Application entrypoint — assembles middleware, routes, and starts
 * the HTTP server only after the database connection is established.
 *
 * Why this structure: The original server.js started listening before
 * confirming the DB was reachable, causing all requests to fail
 * silently when MongoDB was down.
 */

import express from "express";
import cors from "cors";
import webpush from "web-push";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { noteRouter } from "./routes/notes.js";
import { subscriptionRouter } from "./routes/subscription.js";

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Why explicit origin: The original `cors()` allowed every origin (*).
 * Restricting to the frontend URL prevents other websites from making
 * API requests on behalf of users.
 */
app.use(cors({ origin: env.FRONTEND_URL }));

/**
 * Why the limit: Without a body size cap, a single request with a
 * massive payload can exhaust server memory.
 */
app.use(express.json({ limit: "10kb" }));

// ---------------------------------------------------------------------------
// Web Push configuration
// ---------------------------------------------------------------------------

webpush.setVapidDetails(
  `mailto:${env.VAPID_EMAIL}`,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Health check — used by load balancers and monitoring. */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/notes", noteRouter);
app.use("/api/subscribe", subscriptionRouter);

// ---------------------------------------------------------------------------
// Global error handler (must be registered after all routes)
// ---------------------------------------------------------------------------

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

/**
 * Boots the server: connects to MongoDB first, then starts listening.
 *
 * Why async/await with process.exit: If the DB is unreachable the
 * server should fail fast instead of accepting requests it can't serve.
 */
async function start(): Promise<void> {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`[server] Running on port ${env.PORT}`);
    });

    /**
     * Graceful shutdown handler.
     *
     * Why: During deploys (SIGTERM) or manual stops (SIGINT), the
     * server needs to finish in-flight requests and close the DB
     * connection cleanly to prevent data corruption.
     */
    const shutdown = async (signal: string) => {
      console.log(`[server] ${signal} received — shutting down`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
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
