# Wait For It — Production Readiness Improvements

Sequential checklist sorted by severity. Work through these in order.

---

## Critical (System broken / Data at risk)

- [ ] **1. Fix undefined `Subscription` model**
  - `server.js:142` calls `Subscription.findOneAndUpdate()` but the model is never defined
  - The `/subscribe` endpoint crashes with `ReferenceError` on every request
  - **Fix:** Define the Subscription schema/model, or remove the dead endpoint entirely

- [ ] **2. Move encryption key from URL query param to hash fragment**
  - `CreateNote.jsx:47` puts the key in `?key=` which is sent to servers, logged in access logs, browser history, referrer headers, and analytics
  - **Fix:** Change to `#key=` (hash fragments are never sent to servers). Update `ViewNote.jsx` to read from `window.location.hash` instead of `useSearchParams`

- [ ] **3. Replace CryptoJS with Web Crypto API**
  - CryptoJS is unmaintained (last update 2021), uses weak MD5-based key derivation (EvpKDF) when passed a string passphrase
  - The IV parameter is silently ignored when using string passphrase mode, making encryption predictable
  - **Fix:** Use native `crypto.subtle.encrypt/decrypt` with AES-GCM (authenticated encryption). Generate keys with `crypto.subtle.generateKey`

- [ ] **4. Fix inconsistent IV handling between ViewNote and YourNotes**
  - `ViewNote.jsx:62` passes IV as a raw string: `{ iv: data.iv }`
  - `YourNotes.jsx:18` parses IV from hex: `{ iv: CryptoJS.enc.Hex.parse(iv) }`
  - One of these is wrong — decryption will silently fail or produce garbage for one path
  - **Fix:** Unify into a single shared crypto utility with consistent IV handling

- [ ] **5. Crash server on MongoDB connection failure**
  - `server.js:23-26` logs the error but keeps running. All subsequent requests fail with unhandled errors
  - **Fix:** Don't call `app.listen()` until `mongoose.connect()` resolves. Exit the process on connection failure

- [ ] **6. Validate required environment variables at startup**
  - If `MONGO_URI`, `VAPID_PUBLIC_KEY`, or `VAPID_PRIVATE_KEY` are missing, the server crashes mid-initialization with unhelpful errors
  - **Fix:** Check all required env vars before initializing any service. Exit with a clear message listing missing vars

- [ ] **7. Add root `.gitignore`**
  - Only `frontend/.gitignore` exists. The backend has no `.gitignore` — `.env` files with secrets can be accidentally committed
  - **Fix:** Add a root `.gitignore` covering `.env`, `node_modules/`, `dist/`, `.DS_Store`, etc.

---

## High (Security holes / Reliability risks)

- [ ] **8. Add `helmet` middleware for security headers**
  - No `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, or `Content-Security-Policy`
  - **Fix:** `npm install helmet` and add `app.use(helmet())` before routes

- [ ] **9. Configure CORS with explicit allowed origin**
  - `cors()` with no config allows all origins (`*`). Any website can call your API
  - **Fix:** `cors({ origin: process.env.FRONTEND_URL })` and add `FRONTEND_URL` to `.env.example`

- [ ] **10. Set request body size limit**
  - `bodyParser.json()` has no `limit`. An attacker can send a 100MB payload and OOM the server
  - **Fix:** `bodyParser.json({ limit: '10kb' })`

- [ ] **11. Add rate limiting**
  - No throttling on any endpoint. Attackers can spam `POST /api/notes` and fill the database
  - **Fix:** `npm install express-rate-limit`. Apply per-endpoint limits (e.g., 10 notes/min per IP)

- [ ] **12. Add input length validation**
  - `sender`, `receiver`, `message` have no max length on the backend
  - **Fix:** Validate max lengths (e.g., sender/receiver: 100 chars, message: 5000 chars) before saving

- [ ] **13. Add NoSQL injection protection**
  - Request bodies with `$`-prefixed keys (e.g., `{ "sender": { "$gt": "" } }`) can manipulate queries
  - **Fix:** `npm install express-mongo-sanitize` and add `app.use(mongoSanitize())`

- [ ] **14. Add graceful shutdown handler**
  - No `SIGTERM`/`SIGINT` handling. Active requests are dropped during deploys
  - **Fix:** Listen for signals, stop accepting new connections, drain in-flight requests, close MongoDB connection, then exit

- [ ] **15. Add `/health` endpoint**
  - No way for load balancers or container orchestrators to check if the server is alive
  - **Fix:** Add `GET /health` that returns 200 when DB is connected, 503 otherwise

- [ ] **16. Add request logging middleware**
  - No access logs. Impossible to debug or audit production traffic
  - **Fix:** `npm install morgan` and add `app.use(morgan('combined'))` or use `pino-http` for JSON logs

- [ ] **17. Add global unhandled rejection handler**
  - Unhandled promise rejections can crash Node.js silently
  - **Fix:** Add `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` with logging

- [ ] **18. Add frontend error tracking**
  - `ErrorBoundary` catches render errors but only logs to `console.error`. Errors in production are invisible
  - **Fix:** Integrate Sentry or similar. Report errors from both `ErrorBoundary.componentDidCatch` and a global `window.onerror`

- [ ] **19. Fix backend `package.json` metadata**
  - `"main": "index.js"` but the file is `server.js`. No `"start"` script defined
  - **Fix:** Change to `"main": "server.js"` and add `"start": "node server.js"`

---

## Medium (Maintainability / Performance)

- [ ] **20. Extract shared crypto utility on frontend**
  - Encryption logic is duplicated between `CreateNote.jsx`, `ViewNote.jsx`, and `YourNotes.jsx`
  - **Fix:** Create `src/utils/crypto.js` with `encryptMessage()` and `decryptMessage()` functions. Import everywhere

- [ ] **21. Extract API service layer on frontend**
  - `fetch()` calls with `backendUrl` are scattered across components
  - **Fix:** Create `src/services/api.js` with `createNote()`, `fetchNote()`, etc. Centralize error handling

- [ ] **22. Add batch notes endpoint to eliminate N+1 fetches**
  - `YourNotes.jsx:35-56` fires a separate HTTP request per note. 50 notes = 50 requests
  - **Fix:** Add `POST /api/notes/batch` accepting `{ ids: [...] }` and returning all matching notes. Or add `GET /api/notes?ids=id1,id2,id3`

- [ ] **23. Add MongoDB indexes**
  - No indexes beyond the default `_id`. Queries on `receiver` or `revealDate` will do full collection scans
  - **Fix:** Add indexes for any field you query: `noteSchema.index({ revealDate: 1 })`

- [ ] **24. Restructure backend into modules**
  - Everything is in `server.js` — routes, models, config, validation
  - **Fix:** Split into `config/`, `models/`, `routes/`, `middleware/`, `controllers/`. Import and compose in `server.js`

- [ ] **25. Remove dead code and unused dependencies**
  - Commented-out code in `server.js:117-118,128,130-131` and `Header.jsx:8,10`
  - `uuid` package is in frontend `package.json` but never imported
  - `web-push` is configured but non-functional without the Subscription model
  - **Fix:** Delete all commented-out code. Remove `uuid` from dependencies. Either implement or remove web-push

- [ ] **26. Rename `timeToDecrypt` to `isRevealed`**
  - `server.js:114-115` — `timeToDecrypt` is a boolean but reads like a duration
  - **Fix:** Rename to `isRevealed` in both backend response and frontend consumers

- [ ] **27. Replace `alert()` with in-app notifications**
  - `CreateNote.jsx:49,53` uses browser `alert()` for errors — poor UX
  - **Fix:** Use toast notifications or inline error messages within the UI

- [ ] **28. Add response compression**
  - API responses are sent uncompressed
  - **Fix:** `npm install compression` and add `app.use(compression())`

- [ ] **29. Add `Cache-Control` headers**
  - No caching headers on any response
  - **Fix:** Set appropriate cache headers — e.g., unrevealed note responses could be cached for short periods

---

## High (Testing — currently zero)

- [ ] **30. Set up test frameworks**
  - No test runner, no test files, no test configuration
  - **Fix:** Backend: `npm install -D jest supertest mongodb-memory-server`. Frontend: use Vitest (already compatible with Vite)

- [ ] **31. Write backend unit tests**
  - `isValidDate()`, `isValidObjectId()`, input validation logic
  - **Fix:** Test valid/invalid dates, edge cases (empty strings, null, special chars)

- [ ] **32. Write backend integration tests**
  - `POST /api/notes` — valid creation, missing fields, invalid date, oversized input
  - `GET /api/notes/:id` — valid ID, invalid ID, non-existent ID, pre-reveal vs post-reveal
  - **Fix:** Use Supertest with an in-memory MongoDB instance

- [ ] **33. Write frontend component tests**
  - `CreateNote` form validation and submission
  - `ViewNote` rendering in error, loading, revealed, and unrevealed states
  - `YourNotes` with 0 notes, multiple notes, pagination
  - **Fix:** Use React Testing Library + Vitest

- [ ] **34. Write crypto utility tests**
  - Encrypt → decrypt round-trip produces original message
  - Decryption with wrong key fails gracefully
  - Edge cases: empty message, very long message, special characters
  - **Fix:** Unit tests for the shared crypto module (after item #20)

- [ ] **35. Add E2E tests**
  - Full flow: create note → copy link → open link → wait for reveal → see decrypted message
  - **Fix:** Use Playwright or Cypress

---

## High (DevOps — currently none)

- [ ] **36. Add GitHub Actions CI pipeline**
  - No automated checks on pull requests
  - **Fix:** Create `.github/workflows/ci.yml` — lint, test, build on every PR and push to main

- [ ] **37. Add backend Dockerfile**
  - No containerization, deployment is not reproducible
  - **Fix:** Multi-stage Dockerfile: build stage + minimal runtime stage with `node:20-alpine`

- [ ] **38. Add frontend Dockerfile**
  - For environments beyond Vercel
  - **Fix:** Multi-stage build: `npm run build` → serve `dist/` with nginx

- [ ] **39. Add `docker-compose.yml` for local development**
  - No way to spin up the full stack locally with one command
  - **Fix:** Compose file with backend, frontend, and MongoDB services

- [ ] **40. Add pre-commit hooks**
  - No enforcement of lint/format before commits
  - **Fix:** `npm install -D husky lint-staged`. Run eslint + prettier on staged files

---

## Low (Long-term architecture)

- [ ] **41. Add user authentication**
  - Notes are tracked via localStorage only — no cross-device access, no account
  - **Fix:** Implement passwordless auth (magic links) or OAuth. Store note ownership server-side

- [ ] **42. Add API versioning**
  - Routes are `/api/notes` with no version. Breaking changes affect all clients
  - **Fix:** Prefix routes with `/api/v1/`

- [ ] **43. Implement Web Push notifications properly**
  - VAPID is configured, `/subscribe` endpoint exists, but Subscription model is missing and no scheduled job sends notifications
  - **Fix:** Define Subscription model, add a cron/BullMQ job that checks `revealDate` and sends push notifications

- [ ] **44. Add server-side pagination**
  - No `skip`/`limit` support on any endpoint
  - **Fix:** Accept `?page=1&limit=10` query params, return `{ data, total, page, totalPages }`

- [ ] **45. Add structured JSON logging**
  - `console.log` statements with no structure
  - **Fix:** Use `pino` with JSON output. Add correlation IDs per request. Ship logs to a centralized platform

- [ ] **46. Add application metrics**
  - No visibility into request rates, latencies, error rates, DB connection pool
  - **Fix:** Use `prom-client` for Prometheus metrics. Expose on `/metrics` endpoint

- [ ] **47. Add distributed tracing**
  - Cannot trace a request across frontend → backend → MongoDB
  - **Fix:** Integrate OpenTelemetry with auto-instrumentation for Express and Mongoose

- [ ] **48. Evaluate key exchange approach**
  - Current design puts the full decryption key in a shareable link — anyone with the link can decrypt
  - **Fix:** Consider ephemeral key exchange, or require a recipient-set passphrase as a second factor

- [ ] **49. Add secrets rotation strategy**
  - VAPID keys and MongoDB credentials have no rotation plan
  - **Fix:** Use a secrets manager (AWS Secrets Manager / HashiCorp Vault) with periodic rotation

- [ ] **50. Add database backup strategy**
  - No mention of MongoDB backups or point-in-time recovery
  - **Fix:** Enable MongoDB Atlas automated backups, or set up `mongodump` on a schedule with offsite storage

---

## Progress Tracker

| Category | Total | Done |
|----------|-------|------|
| Critical | 7 | 0 |
| High — Security/Reliability | 12 | 0 |
| Medium — Maintainability/Perf | 10 | 0 |
| Testing | 6 | 0 |
| DevOps | 5 | 0 |
| Long-term | 10 | 0 |
| **Total** | **50** | **0** |
