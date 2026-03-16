/**
 * Note viewing page — displays a note and handles decryption.
 *
 * Why two useEffects: The first resolves the encryption key (from URL
 * or localStorage), and the second fetches + decrypts only after the
 * key is available. This separation avoids race conditions.
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { decryptMessage } from "../utils/crypto";
import { fetchNote } from "../services/api";
import type { DisplayNote } from "../types";

const ViewNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [note, setNote] = useState<DisplayNote | null>(null);
  const [error, setError] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const baseURL = window.location.origin;

  /**
   * Step 1: Resolve the encryption key.
   *
   * Why localStorage fallback: When a user returns via a push notification
   * or bookmark, the URL might not contain the key. We store it on first
   * visit so subsequent visits can still decrypt.
   */
  useEffect(() => {
    if (!id) return;

    const keyFromUrl = searchParams.get("key");

    if (keyFromUrl) {
      setEncryptionKey(keyFromUrl);
      localStorage.setItem(`note-key-${id}`, keyFromUrl);
    } else {
      const storedKey = localStorage.getItem(`note-key-${id}`);
      if (storedKey) {
        setEncryptionKey(storedKey);
        setSearchParams({ key: storedKey });
      } else {
        setError(
          "Missing encryption key! Please use the original link provided by the sender."
        );
      }
    }
  }, [id, searchParams, setSearchParams]);

  /**
   * Step 2: Fetch the note and decrypt if the reveal date has passed.
   *
   * Why the isRevealed check: The server returns the ciphertext only
   * after the reveal date. Before that it returns a placeholder message
   * that we display as-is (no decryption needed).
   */
  useEffect(() => {
    if (!encryptionKey || !id) return;

    const loadNote = async () => {
      try {
        const data = await fetchNote(id);

        if (data.isRevealed) {
          const decrypted = decryptMessage(data.message, encryptionKey, data.iv);
          if (!decrypted) {
            throw new Error("Failed to decrypt the message.");
          }

          setNote({
            sender: data.sender,
            receiver: data.receiver,
            message: decrypted,
            revealDate: new Date(data.revealDate).toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour12: true,
            }),
          });
        } else {
          setNote({
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            revealDate: data.revealDate,
          });
        }
      } catch (err) {
        console.error("Error fetching or decrypting the note:", err);
        setError("An error occurred. Please try again later.");
      }
    };

    loadNote();
  }, [encryptionKey, id]);

  /** Copies the full share link (with encryption key) to the clipboard. */
  const copyToClipboard = () => {
    const key = searchParams.get("key");
    const noteLink = `${baseURL}/notes/${id}?key=${key}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(noteLink)
        .then(() => setCopyButtonText("Copied!"))
        .catch(() => setCopyButtonText("Failed to Copy"));
    } else {
      fallbackCopyToClipboard(noteLink);
    }

    setTimeout(() => setCopyButtonText("Copy Link"), 2000);
  };

  /**
   * Fallback clipboard copy for browsers without Clipboard API.
   *
   * Why: Mobile Safari and older browsers don't always support
   * navigator.clipboard. This uses a hidden textarea + execCommand.
   */
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";
    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      setCopyButtonText("Copied!");
    } catch (err) {
      console.error("Fallback copy failed:", err);
      setCopyButtonText("Failed to Copy");
    } finally {
      textArea.remove();
    }
  };

  /** Opens WhatsApp with a pre-filled message containing the note link. */
  const shareOnWhatsApp = () => {
    if (!note || !id) return;

    const key = searchParams.get("key");
    const noteLink = `${baseURL}/notes/${id}?key=${key}`;
    const whatsappMessage = `Hey ${note.receiver}, ${note.sender} left you a note... Open it here: ${noteLink}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, "_blank");
  };

  /**
   * Captures the note as a PNG image and triggers a download.
   *
   * Why DOM cloning: We build a screenshot-friendly version off-screen
   * (without share buttons) so the saved image looks clean.
   */
  const handleSaveAsImage = () => {
    const noteElement = document.querySelector("#note-div");
    const headerElement = document.querySelector("#head");

    if (!noteElement || !headerElement) {
      setError("Required elements for screenshot not found.");
      return;
    }

    const container = document.createElement("div");
    container.style.backgroundColor = "#F3E9FF";
    container.style.padding = "20px";
    container.style.display = "flex";
    container.style.borderRadius = "8px";
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const headerClone = headerElement.cloneNode(true) as HTMLElement;
    const noteClone = noteElement.cloneNode(true) as HTMLElement;

    const shareButtons = noteClone.querySelector(".share-buttons");
    if (shareButtons) shareButtons.remove();

    noteClone.style.boxShadow = "none";
    noteClone.style.padding = "30px 40px";
    headerClone.style.paddingRight = "30px";

    container.appendChild(headerClone);
    container.appendChild(noteClone);
    document.body.appendChild(container);

    html2canvas(container, { backgroundColor: "#ffecd2" }).then((canvas) => {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `secretnote-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(container);
    });
  };

  /**
   * Formats a date string for display using the en-GB locale.
   *
   * Why en-GB: Provides dd/mm/yyyy format consistent with the date
   * picker used in CreateNote.
   */
  const formatRevealDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateStr));
  };

  return (
    <div className="px-4 py-10 min-h-[calc(96vh-105px)] bg-[#F3E9FF] flex justify-center items-center font-montserrat">
      <div
        id="note-div"
        className="note-box w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-[#E5D5FA] p-6 space-y-4 text-[#14051E]"
      >
        {error ? (
          <p className="error-message text-red-600 text-center font-medium">
            {error}
          </p>
        ) : note ? (
          <>
            <p className="text-sm md:text-base">
              <strong>From:</strong> {note.sender}
            </p>
            <p className="text-sm md:text-base">
              <strong>To:</strong> {note.receiver}
            </p>
            <p className="text-sm md:text-base break-words whitespace-pre-wrap">
              <strong>Message:</strong> {note.message}
            </p>
            <p className="text-sm md:text-base">
              <strong>Reveal Date:</strong> {formatRevealDate(note.revealDate)}
            </p>

            <div className="share-buttons flex flex-col sm:flex-row flex-wrap gap-4 pt-4 justify-center sm:justify-start">
              <button
                onClick={copyToClipboard}
                className="copy-button px-4 py-2 bg-[#50125F] text-white rounded-full hover:bg-[#3A0D45] transition"
              >
                {copyButtonText}
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="whatsapp-button flex justify-center items-center gap-2 px-4 py-2 border border-[#25D366] text-[#25D366] rounded-full hover:bg-[#25D366]/10 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="whatsapp-icon w-5 h-5"
                />
                WhatsApp
              </button>

              <button
                onClick={handleSaveAsImage}
                className="image-button px-4 py-2 border border-[#50125F] text-[#50125F] rounded-full hover:bg-[#50125F] hover:text-white transition"
              >
                Save As Image
              </button>
            </div>
          </>
        ) : (
          <p className="text-center">Loading note...</p>
        )}
      </div>
    </div>
  );
};

export default ViewNote;
