import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import CryptoJS from "crypto-js";

function CreateNote() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState(() => {
    const now = new Date();
    now.setSeconds(0);
    return now;
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
      const iv = CryptoJS.lib.WordArray.random(16).toString();
      const encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey, {
        iv,
      }).toString();
      const revealDateISO = formatISO(revealDate);

      const response = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          receiver,
          message: encryptedMessage,
          iv,
          revealDate: revealDateISO,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/notes/${data.id}?key=${encryptionKey}`);
      } else {
        alert("Failed to create the note. Please try again.");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("An error occurred. Please try again later.");
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
          Whisper your message🤫..!
        </h2>

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
          ></textarea>
        </div>

        {/* Reveal Date */}
        <div className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-x-6">
          <label className="w-full md:w-32 text-lg font-medium text-[#50125F]">
            Reveal At
          </label>
          <DatePicker
            selected={revealDate}
            onChange={(date) => {
              const adjusted = new Date(date);
              adjusted.setSeconds(0);
              setRevealDate(adjusted);
            }}
            showTimeInput
            dateFormat="dd/MM/yyyy h:mm aa"
            timeInputLabel="Time:"
            className="w-full md:max-w-md px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-black text-sm"
            onFocus={(e) => (e.target.readOnly = true)}
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
                <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></span>
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
}

export default CreateNote;
