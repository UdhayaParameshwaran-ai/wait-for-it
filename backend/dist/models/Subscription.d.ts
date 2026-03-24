/**
 * Mongoose model for Web Push notification subscriptions.
 *
 * Why: This was the missing model that caused the /subscribe endpoint
 * to crash with a ReferenceError. Each document links a browser's
 * push subscription to a specific note so we can notify the recipient
 * when the reveal date arrives.
 */
import mongoose from "mongoose";
import type { ISubscription } from "../types/index.js";
export declare const Subscription: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}> & ISubscription & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
