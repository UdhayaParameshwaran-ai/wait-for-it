"use strict";
/**
 * Web Push subscription routes.
 *
 * Why this file exists: The original codebase had a /subscribe endpoint
 * that crashed because the Subscription model was never defined.
 * This module provides the working implementation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRouter = void 0;
const express_1 = require("express");
const Subscription_js_1 = require("../models/Subscription.js");
const validate_js_1 = require("../middleware/validate.js");
exports.subscriptionRouter = (0, express_1.Router)();
/**
 * POST /api/subscribe — Save or update a push notification subscription.
 *
 * Why upsert: A user might re-subscribe from the same browser for the
 * same note (e.g., after clearing the page). Upsert prevents duplicates
 * by matching on userId + noteId (compound unique index).
 */
exports.subscriptionRouter.post("/", async (req, res, next) => {
    try {
        const data = (0, validate_js_1.validateSubscription)(req.body);
        await Subscription_js_1.Subscription.findOneAndUpdate({ userId: data.userId, noteId: data.noteId }, {
            subscription: data.subscription,
            revealDate: new Date(data.revealDate),
            notified: false,
        }, { upsert: true, new: true });
        res.status(201).json({ message: "Subscription saved." });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=subscription.js.map