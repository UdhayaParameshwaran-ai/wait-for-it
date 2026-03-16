/**
 * Mongoose model for Web Push notification subscriptions.
 *
 * Why: This was the missing model that caused the /subscribe endpoint
 * to crash with a ReferenceError. Each document links a browser's
 * push subscription to a specific note so we can notify the recipient
 * when the reveal date arrives.
 */

import mongoose, { Schema } from "mongoose";
import type { ISubscription } from "../types/index.js";

const subscriptionSchema = new Schema<ISubscription>(
  {
    /** Anonymous device identifier stored in the client's localStorage. */
    userId: { type: String, required: true },

    /** The note this subscription watches for reveal. */
    noteId: { type: String, required: true },

    /** When the note should be revealed — duplicated here for efficient querying. */
    revealDate: { type: Date, required: true },

    /** Whether we have already sent a push notification for this note. */
    notified: { type: Boolean, default: false },

    /** The PushSubscription object from the browser's Push API. */
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
);

/**
 * Why this compound index: the notification cron job queries
 * { notified: false, revealDate: { $lte: now } } on every tick.
 * Without an index this is a full collection scan.
 */
subscriptionSchema.index({ notified: 1, revealDate: 1 });

/**
 * Why this compound index: prevents duplicate subscriptions for
 * the same user + note combination (upsert target).
 */
subscriptionSchema.index({ userId: 1, noteId: 1 }, { unique: true });

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
