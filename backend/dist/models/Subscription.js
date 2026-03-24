"use strict";
/**
 * Mongoose model for Web Push notification subscriptions.
 *
 * Why: This was the missing model that caused the /subscribe endpoint
 * to crash with a ReferenceError. Each document links a browser's
 * push subscription to a specific note so we can notify the recipient
 * when the reveal date arrives.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
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
exports.Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
//# sourceMappingURL=Subscription.js.map