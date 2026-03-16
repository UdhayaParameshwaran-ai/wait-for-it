/**
 * API service layer for communicating with the backend.
 *
 * Why centralized: The original codebase had raw `fetch()` calls
 * scattered across components, each duplicating the backend URL
 * construction, headers, and error handling. This module provides
 * typed functions with consistent error handling.
 */

import type {
  CreateNotePayload,
  CreateNoteResponse,
  NoteResponse,
} from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Custom error for API failures that carries the HTTP status code.
 *
 * Why: Allows callers to distinguish between network errors,
 * 404s, validation errors (400), and server errors (500).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Shared fetch wrapper that handles JSON parsing and error responses.
 *
 * Why: Every API call needs the same response-checking logic.
 * Centralizing it here means a single place to add auth headers,
 * retry logic, or logging in the future.
 */
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      (body as { error?: string }).error ?? "Request failed",
      response.status
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Creates a new encrypted note on the server.
 *
 * @param payload - Note data including encrypted message and IV.
 * @returns The created note's ID for building the share link.
 */
export async function createNote(
  payload: CreateNotePayload
): Promise<CreateNoteResponse> {
  return request<CreateNoteResponse>("/api/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches a single note by its ID.
 *
 * @param id - The MongoDB document ID of the note.
 * @returns The note data, including whether it has been revealed.
 */
export async function fetchNote(id: string): Promise<NoteResponse> {
  return request<NoteResponse>(`/api/notes/${id}`);
}

/**
 * Fetches multiple notes by their IDs.
 *
 * Why individual fetches: The backend currently has no batch endpoint.
 * This function fires requests in parallel and filters out failures
 * so one bad note doesn't break the entire "Your Notes" page.
 *
 * @param ids - Array of note IDs to fetch.
 * @returns Array of successfully fetched notes with their IDs attached.
 */
export async function fetchNotesByIds(
  ids: string[]
): Promise<(NoteResponse & { id: string })[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const note = await fetchNote(id);
        return { ...note, id };
      } catch (err) {
        console.error(`Failed to fetch note ${id}:`, err);
        return null;
      }
    })
  );

  return results.filter(
    (note): note is NoteResponse & { id: string } => note !== null
  );
}
