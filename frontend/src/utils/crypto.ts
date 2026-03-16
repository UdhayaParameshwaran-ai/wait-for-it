/**
 * Encryption and decryption utilities using CryptoJS.
 *
 * Why centralized: The original codebase had encryption logic duplicated
 * across CreateNote, ViewNote, and YourNotes — with inconsistent IV
 * handling between ViewNote (raw string) and YourNotes (hex-parsed).
 * This module provides a single, consistent implementation.
 *
 * Note: CryptoJS is used as a transitional dependency. A future
 * improvement should replace it with the native Web Crypto API
 * (crypto.subtle) for better security and maintained support.
 */

import CryptoJS from "crypto-js";

/**
 * Generates a random AES encryption key and initialization vector.
 *
 * Why separate key/IV: AES requires a unique IV per encryption to
 * prevent identical plaintexts from producing identical ciphertexts.
 * The IV can be stored alongside the ciphertext; the key must stay secret.
 *
 * @returns Object containing hex-encoded key and IV strings.
 */
export function generateKeyAndIV(): { key: string; iv: string } {
  return {
    key: CryptoJS.lib.WordArray.random(32).toString(),
    iv: CryptoJS.lib.WordArray.random(16).toString(),
  };
}

/**
 * Encrypts a plaintext message using AES with the given key and IV.
 *
 * @param message  - The plaintext to encrypt.
 * @param key      - Hex-encoded AES key.
 * @param iv       - Hex-encoded initialization vector.
 * @returns Base64-encoded ciphertext string.
 */
export function encryptMessage(
  message: string,
  key: string,
  iv: string
): string {
  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
  });
  return encrypted.toString();
}

/**
 * Decrypts an AES-encrypted message using the given key and IV.
 *
 * Why the empty-string check: CryptoJS returns an empty string
 * (not an error) when decryption fails due to a wrong key or
 * corrupted ciphertext. We convert this to null for explicit
 * error handling by the caller.
 *
 * @param ciphertext - Base64-encoded encrypted message.
 * @param key        - Hex-encoded AES key.
 * @param iv         - Hex-encoded initialization vector.
 * @returns Decrypted plaintext, or null if decryption failed.
 */
export function decryptMessage(
  ciphertext: string,
  key: string,
  iv: string
): string | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
    }).toString(CryptoJS.enc.Utf8);

    return decrypted || null;
  } catch {
    return null;
  }
}
