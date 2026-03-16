/**
 * Shared type definitions for the Wait For It frontend.
 *
 * Why centralized: Components, services, and utils all need the same
 * shapes for notes and API responses. A single source of truth prevents
 * drift between what the API returns and what the UI expects.
 */

/** The shape of a note as returned by GET /api/notes/:id. */
export interface NoteResponse {
  sender: string;
  receiver: string;
  message: string;
  iv: string;
  revealDate: string;
  isRevealed: boolean;
}

/** A note with its client-side ID, used for display in lists. */
export interface NoteWithId extends NoteResponse {
  id: string;
}

/** The payload sent to POST /api/notes when creating a note. */
export interface CreateNotePayload {
  sender: string;
  receiver: string;
  message: string;
  iv: string;
  revealDate: string;
}

/** The response from POST /api/notes after successful creation. */
export interface CreateNoteResponse {
  id: string;
}

/** A note as displayed in the UI after decryption. */
export interface DisplayNote {
  sender: string;
  receiver: string;
  message: string;
  revealDate: string;
}
