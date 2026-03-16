# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wait For It** — a time-locked encrypted notes app. Users create AES-encrypted messages that are only revealed after a chosen date/time. The encryption key is passed via the URL so the server never sees plaintext.

## Architecture

Monorepo with two independent packages (no workspace manager):

- **`backend/`** — Express 5 + Mongoose + web-push. Single file (`server.js`) with all routes, models, and config.
- **`frontend/`** — React 19 + Vite + Tailwind CSS v4. Deployed on Vercel.

### Data Flow

1. Frontend generates AES key + IV (CryptoJS), encrypts the message client-side
2. `POST /api/notes` sends encrypted message + IV + metadata to backend, which stores in MongoDB
3. Backend returns note `_id`; frontend navigates to `/notes/:id?key=<encryptionKey>`
4. `GET /api/notes/:id` checks if `revealDate` has passed — returns encrypted message or placeholder
5. Frontend decrypts client-side using the key from the URL/localStorage

### Backend API

- `POST /api/notes` — create a note (sender, receiver, message, iv, revealDate)
- `GET /api/notes/:id` — fetch a note (returns `timeToDecrypt: true/false` based on revealDate)
- `POST /subscribe` — web push subscription (currently broken: `Subscription` model is undefined)

### Frontend Routes

- `/` — Landing page (Hero + About/How It Works tabs)
- `/create-note` — Note creation form with date picker
- `/notes/:id` — View a note (decrypts if reveal date passed)
- `/your-notes` — Lists notes stored in localStorage (fetches each one individually from backend)

### Key Design Decisions

- Encryption keys live only in the URL and localStorage — the server never has them
- "Your Notes" page uses localStorage keys (`note-key-{id}`) to enumerate which notes the user has access to — there is no user authentication
- The IV is stored in MongoDB alongside the ciphertext

## Commands

### Backend

```bash
cd backend
npm install
# No start script defined — run directly:
node server.js
```

Required env vars (see `backend/.env.example`):
- `MONGO_URI`
- `VAPID_EMAIL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- `PORT` (optional, defaults to 5000)

### Frontend

```bash
cd frontend
npm install
npm run dev      # Vite dev server with HMR
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

Required env vars (see `frontend/.env.example`):
- `VITE_BACKEND_API_URL`
- `VITE_VAPID_PUBLIC_KEY`

### Tests

No test framework or test files exist yet. Backend `package.json` has a placeholder test script.

## Known Issues

- **`/subscribe` endpoint crashes**: references undefined `Subscription` model (`server.js:142`)
- **Inconsistent IV handling**: `ViewNote.jsx` passes IV as raw string, `YourNotes.jsx` parses it with `CryptoJS.enc.Hex.parse()` — one is wrong
- **Encryption key in URL query param** (`?key=`): logged in server access logs and browser history. Should use hash fragment (`#key=`)
- **CryptoJS string passphrase mode**: uses weak MD5-based EvpKDF and silently ignores the IV parameter
- **No root `.gitignore`**: only `frontend/.gitignore` exists — backend `.env` is unprotected
- `backend/package.json` has `"main": "index.js"` but the actual entry point is `server.js`
- `uuid` is in frontend dependencies but never imported

See `IMPROVEMENTS.md` for the full prioritized remediation checklist.
