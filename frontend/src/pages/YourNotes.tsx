/**
 * "Your Notes" page — lists all notes the user has previously accessed.
 *
 * Why localStorage-based: There is no user authentication yet, so we
 * enumerate notes by scanning localStorage for `note-key-{id}` entries
 * that were saved when the user first viewed a note. This means the
 * list is device-specific and lost when storage is cleared.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decryptMessage } from "../utils/crypto";
import { fetchNotesByIds } from "../services/api";
import type { NoteResponse } from "../types";

/** A note with its ID attached, returned by the batch fetch. */
interface NoteListItem extends NoteResponse {
  id: string;
}

const YourNotes: React.FC = () => {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 9;

  /**
   * Loads all notes whose keys exist in localStorage.
   *
   * Why fetchNotesByIds: The original code fired a separate fetch per
   * note inside a Promise.all. The API service function does the same
   * thing under the hood (no batch endpoint yet) but centralises the
   * error handling and type safety.
   */
  useEffect(() => {
    const noteIds = Object.keys(localStorage)
      .filter((key) => key.startsWith("note-key-"))
      .map((key) => key.replace("note-key-", ""));

    if (noteIds.length === 0) {
      setLoading(false);
      return;
    }

    fetchNotesByIds(noteIds)
      .then(setNotes)
      .catch(() => setError("Failed to load your notes."))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Produces a short preview of the note message.
   *
   * Why decrypt here: If the reveal date has passed, we decrypt
   * client-side to show a snippet. If not yet revealed, we show
   * the server's placeholder string.
   */
  const getSnippet = (note: NoteListItem): string => {
    const now = new Date();
    const revealDate = new Date(note.revealDate);

    if (now >= revealDate) {
      const storedKey = localStorage.getItem(`note-key-${note.id}`);
      if (storedKey) {
        const decrypted = decryptMessage(note.message, storedKey, note.iv);
        if (decrypted && decrypted.length > 0) {
          return decrypted.length > 100
            ? decrypted.substring(0, 100) + "..."
            : decrypted;
        }
      }
      return "Open to read the note";
    }

    return "You have to wait for it. The message is still hidden!";
  };

  const totalPages = Math.ceil(notes.length / ITEMS_PER_PAGE);
  const displayedNotes = notes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="your-notes-container px-4 py-8 bg-[#F3E9FF] min-h-[calc(96vh-105px)] font-montserrat flex flex-col">
      {error && (
        <div className="error-message text-red-600 text-center font-semibold mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-lg text-[#50125F]">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="empty-message text-center text-lg text-[#50125F]">
          You don't have any notes yet.
        </p>
      ) : (
        <>
          <div className="notes-list grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayedNotes.map((note) => (
              <div
                key={note.id}
                className="note-summary bg-white shadow-lg rounded-xl p-3 hover:shadow-2xl transition cursor-pointer border border-[#E5D5FA]"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <p className="mb-2 text-sm text-gray-700">
                  <strong>From:</strong> {note.sender}
                </p>
                <p className="mb-2 text-sm text-gray-700">
                  <strong>To:</strong> {note.receiver}
                </p>
                <p className="mb-2 text-sm text-gray-700">
                  <strong>Reveal Date:</strong>{" "}
                  {new Date(note.revealDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Message:</strong> {getSnippet(note)}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination mt-auto pt-8">
              <div className="flex justify-center items-center space-x-6 text-[#50125F] font-medium">
                <button
                  className="pagination-button px-4 py-1 border border-[#50125F] rounded-full hover:bg-[#50125F] hover:text-white disabled:opacity-30"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-button px-4 py-1 border border-[#50125F] rounded-full hover:bg-[#50125F] hover:text-white disabled:opacity-30"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YourNotes;
