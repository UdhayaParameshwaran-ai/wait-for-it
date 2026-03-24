/**
 * Environment variable validation and typed config export.
 *
 * Why: Validates all required env vars at import time so the server
 * fails fast with a clear message instead of crashing mid-request
 * with an unhelpful "Cannot read properties of undefined" error.
 */
import "dotenv/config";
import type { EnvConfig } from "../types/index.js";
/** Validated, typed environment config. Importable from any module. */
export declare const env: EnvConfig;
