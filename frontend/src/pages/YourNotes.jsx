import CryptoJS from "crypto-js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL; //process.env.REACT_APP_BACKEND_API_URL;
  const itemsPerPage = 9;

  // Function to decrypt a note's message using CryptoJS
  const decryptNoteMessage = (encryptedMessage, encryptionKey, iv) => {
    try {
      // Parse IV from hex if needed (assuming encryptionKey is a string)
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
      }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error("Decryption error for note:", error);
      return null;
    }
  };

  useEffect(() => {
    // Iterate over all localStorage keys and filter those starting with "note-key-"
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("note-key-")
    );
    const noteIds = keys.map((key) => key.replace("note-key-", ""));

    // Fetch note details for each noteId from the backend
    Promise.all(
      noteIds.map((noteId) =>
        fetch(`${backendUrl}/api/notes/${noteId}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch note ${noteId}`);
            return res.json();
          })
          .then((data) => ({ ...data, id: noteId }))
          .catch((err) => {
            console.error("Error fetching note", noteId, err);
            return null;
          })
      )
    )
      .then((results) => {
        const validNotes = results.filter((note) => note !== null);
        setNotes(validNotes);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setError("Failed to load your notes.");
      });
  }, [backendUrl]);

  // Calculate pagination details
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const displayedNotes = notes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
   <div className="your-notes-container px-4 py-8 bg-[#F3E9FF] min-h-[calc(97vh-105px)] font-montserrat flex flex-col">

  {error && (
    <div className="error-message text-red-600 text-center font-semibold mb-4">
      {error}
    </div>
  )}
 
  {notes.length === 0 ? (
    <p className="empty-message text-center text-lg text-[#50125F]">
      You don't have any notes yet.
    </p>
  ) : (
    <>
      {/* Notes List */}
      <div className="notes-list grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {displayedNotes.map((note) => {
          const now = new Date();
          const noteRevealDate = new Date(note.revealDate);
          let snippet = "";

          if (now >= noteRevealDate) {
            const storedKey = localStorage.getItem(`note-key-${note.id}`);
            if (storedKey) {
              const decrypted = decryptNoteMessage(
                note.message,
                storedKey,
                note.iv
              );
              snippet =
                decrypted && decrypted.length > 0
                  ? decrypted.substring(0, 100) + (decrypted.length > 100 ? "..." : "")
                  : "Open to read the note";
            } else {
              snippet = "Open to read the note";
            }
          } else {
            snippet = "This Sweetnote is still hidden! 🤫";
          }

          return (
            <div
              key={note.id}
              className="note-summary bg-white shadow-lg rounded-xl p-3 hover:shadow-2xl transition cursor-pointer border border-[#E5D5FA]"
              onClick={() => handleNoteClick(note.id)}
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
                <strong>Message:</strong> {snippet}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
<div className="pagination mt-auto pt-8">
  <div className="flex justify-center items-center space-x-6 text-[#50125F] font-medium">
    <button
      className="pagination-button px-4 py-1 border border-[#50125F] rounded-full hover:bg-[#50125F] hover:text-white disabled:opacity-30"
      onClick={handlePrevious}
      disabled={currentPage === 1}
    >
      Previous
    </button>
    <span className="pagination-info">
      Page {currentPage} of {totalPages}
    </span>
    <button
      className="pagination-button px-4 py-1 border border-[#50125F] rounded-full hover:bg-[#50125F] hover:text-white disabled:opacity-30"
      onClick={handleNext}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>

    </>
  )}
</div>

  );
};

export default YourNotes;
