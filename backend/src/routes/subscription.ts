/**
 * Web Push subscription routes.
 *
 * Why this file exists: The original codebase had a /subscribe endpoint
 * that crashed because the Subscription model was never defined.
 * This module provides the working implementation.
 */

import { Router } from "express";
import { Subscription } from "../models/Subscription.js";
import { validateSubscription } from "../middleware/validate.js";

export const subscriptionRouter = Router();

/**
 * POST /api/subscribe — Save or update a push notification subscription.
 *
 * Why upsert: A user might re-subscribe from the same browser for the
 * same note (e.g., after clearing the page). Upsert prevents duplicates
 * by matching on userId + noteId (compound unique index).
 */
subscriptionRouter.post("/", async (req, res, next) => {
  try {
    const data = validateSubscription(req.body);

    await Subscription.findOneAndUpdate(
      { userId: data.userId, noteId: data.noteId },
      {
        subscription: data.subscription,
        revealDate: new Date(data.revealDate),
        notified: false,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved." });
  } catch (err) {
    next(err);
  }
});
