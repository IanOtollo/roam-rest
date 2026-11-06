import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password and email hashing for the single admin account.
 *
 * Nothing sensitive is stored in readable form. The server keeps only:
 *   - ADMIN_EMAIL_HASH:    HMAC-SHA256 of the allowed email, keyed with a secret pepper
 *   - ADMIN_PASSWORD_HASH: a salted scrypt hash of the password
 * so even someone who reads the environment cannot recover the email or password, and bots
 * cannot learn which email is allowed.
 *
 * The same format is produced by scripts/admin-setup.mjs. Keep the two in step.
 */

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export function hashEmail(email: string, pepper: string) {
  return createHmac("sha256", pepper).update(normaliseEmail(email)).digest("hex");
}

/*
  Format: scrypt:N:r:p:salt:hash  (base64url). Colons, not "$": Next.js treats "$name" inside
  .env files as a variable reference and would silently corrupt the stored hash.
*/
export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

/** Verifies a password against a stored hash. Always does the full amount of work. */
export function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  try {
    const expected = Buffer.from(hashB64, "base64url");
    const actual = scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** A real-looking hash used so a wrong email costs the same time as a wrong password. */
export const DUMMY_PASSWORD_HASH = `scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA:${Buffer.alloc(KEYLEN, 7).toString("base64url")}`;

export function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // Compare fixed-length digests so lengths never leak.
  return timingSafeEqual(createHash("sha256").update(ab).digest(), createHash("sha256").update(bb).digest());
}

/** Opaque key for rate limiting: a keyed hash of the visitor's IP, never the IP itself. */
export function hashKey(value: string, pepper: string) {
  return createHmac("sha256", pepper).update(`ip:${value}`).digest("hex");
}

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("base64url");
