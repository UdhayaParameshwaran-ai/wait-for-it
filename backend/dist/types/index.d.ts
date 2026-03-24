/**
 * Shared type definitions for the Wait For It backend.
 *
 * Why: Centralizes all interfaces so that models, routes, and middleware
 * reference a single source of truth for request/response shapes.
 */
import type { Document } from "mongoose";
/** Fields stored in MongoDB for a single encrypted note. */
export interface INote extends Document {
    sender: string;
    receiver: string;
    message: string;
    iv: string;
    revealDate: Date;
}
/** Shape of the JSON body accepted by POST /api/notes. */
export interface CreateNoteRequest {
    sender: string;
    receiver: string;
    message: string;
    iv: string;
    revealDate: string;
}
/**
 * Shape of the JSON response returned by GET /api/notes/:id.
 *
 * Why `isRevealed`: replaces the old `timeToDecrypt` boolean whose name
 * read like a duration rather than a flag.
 */
export interface NoteResponse {
    sender: string;
    receiver: string;
    message: string;
    iv: string;
    revealDate: string;
    isRevealed: boolean;
}
/** Browser Push API subscription keys. */
export interface PushKeys {
    p256dh: string;
    auth: string;
}
/** The standard PushSubscription shape the browser gives us. */
export interface PushSubscriptionJSON {
    endpoint: string;
    keys: PushKeys;
}
/** Fields stored in MongoDB for a push-notification subscription. */
export interface ISubscription extends Document {
    userId: string;
    noteId: string;
    revealDate: Date;
    notified: boolean;
    subscription: PushSubscriptionJSON;
}
/** Shape of the JSON body accepted by POST /api/subscribe. */
export interface SubscribeRequest {
    subscription: PushSubscriptionJSON;
    userId: string;
    noteId: string;
    revealDate: string;
}
/**
 * Typed, validated environment configuration.
 *
 * Why: Gives every module a typed config object instead of raw
 * `process.env` lookups that can silently be `undefined`.
 */
export interface EnvConfig {
    PORT: number;
    MONGO_URI: string;
    VAPID_EMAIL: string;
    VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    FRONTEND_URL: string;
}
