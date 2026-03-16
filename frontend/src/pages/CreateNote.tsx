/**
 * Note creation page — where users compose and encrypt a secret message.
 *
 * Why client-side encryption happens here: The encryption key is generated
 * in the browser and never sent to the server. Only the ciphertext + IV
 * are stored. The key is passed via the URL to the ViewNote page.
 */

import { useState } from "react";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { generateKeyAndIV, encryptMessage } from "../utils/crypto";
import { createNote } from "../services/api";

const CreateNote: React.FC = () => {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState<Date>(() => {
    const now = new Date();
    now.setSeconds(0);
    return now;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Encrypts the message and sends it to the backend.
   *
   * Why formatISO: Ensures the date is sent in a timezone-aware ISO 8601
   * format that the backend can reliably parse.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { key, iv } = generateKeyAndIV();
      const encrypted = encryptMessage(message, key, iv);
      const revealDateISO = formatISO(revealDate);

      const data = await createNote({
        sender,
        receiver,
        message: encrypted,
        iv,
        revealDate: revealDateISO,
      });

      /**
       * Why query param for the key: The key must be passed to the
       * ViewNote page so the recipient can decrypt the message.
       * A future improvement should use a URL hash fragment (#key=)
       * instead, since fragments are not sent to the server.
       */
      navigate(`/notes/${data.id}?key=${key}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(96vh-105px)] w-full bg-[#F3E9FF]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto px-4 md:px-12 py-6 md:pt-20 space-y-4 md:space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-medium text-[#14051E] text-center mb-8">
          Whisper your message...!
        </h2>

        {error && (
          <p className="text-red-600 text-center font-medium text-sm">
            {error}
          </p>
        )}

        {/* Sender */}
        <div className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-x-6">
          <label className="w-full md:w-32 text-lg font-medium text-[#50125F]">
            From
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Your name"
            required
            maxLength={100}
            className="w-full md:max-w-md px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* Receiver */}
        <div className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-x-6">
          <label className="w-full md:w-32 text-lg font-medium text-[#50125F]">
            To
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Recipient's name"
            required
            maxLength={100}
            className="w-full md:max-w-md px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-x-6">
          <label className="w-full md:w-32 text-lg font-medium text-[#50125F]">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your secret..."
            required
            rows={3}
            className="w-full md:max-w-md px-3 py-2 border rounded-3xl resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* Reveal Date */}
        <div className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-x-6">
          <label className="w-full md:w-32 text-lg font-medium text-[#50125F]">
            Reveal At
          </label>
          <DatePicker
            selected={revealDate}
            onChange={(date: Date | null) => {
              if (date) {
                const adjusted = new Date(date);
                adjusted.setSeconds(0);
                setRevealDate(adjusted);
              }
            }}
            showTimeInput
            dateFormat="dd/MM/yyyy h:mm aa"
            timeInputLabel="Time:"
            className="w-full md:max-w-md px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-black text-sm"
            onFocus={(e) => ((e.target as HTMLInputElement).readOnly = true)}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-64 py-2 my-5 rounded-full text-white font-medium bg-gradient-to-r from-[#14051E] via-[#2D0A3A] to-[#3F0F4F] hover:from-[#1E082A] hover:via-[#3A0D45] hover:to-[#50125F] text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full" />
                Sending...
              </div>
            ) : (
              "Send Secret Note"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;
