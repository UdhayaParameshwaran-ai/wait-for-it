/**
 * Web Push subscription routes.
 *
 * Why this file exists: The original codebase had a /subscribe endpoint
 * that crashed because the Subscription model was never defined.
 * This module provides the working implementation.
 */
export declare const subscriptionRouter: import("express-serve-static-core").Router;
