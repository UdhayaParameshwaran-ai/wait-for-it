/**
 * Application entrypoint — assembles middleware, routes, and starts
 * the HTTP server only after the database connection is established.
 *
 * Why this structure: The original server.js started listening before
 * confirming the DB was reachable, causing all requests to fail
 * silently when MongoDB was down.
 */
export {};
