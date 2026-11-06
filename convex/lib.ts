import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Every admin function takes the shared secret as its first argument. The secret lives only
 * in two places: the Convex deployment's environment (ADMIN_API_SECRET) and the Next.js
 * server's environment. The browser never sees it. The Next.js server only sends it after
 * checking the admin's signed session cookie.
 */
export function assertAdmin(secret: string) {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || expected.length < 32 || !safeEqual(secret, expected)) {
    // Deliberately vague: callers learn nothing about why.
    throw new ConvexError("Not allowed.");
  }
}

/** Compares two strings in time that does not depend on where they first differ. */
export function safeEqual(a: string, b: string) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const isIsoDate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Turns a stored image reference into a URL: site paths pass through, storage ids resolve. */
export async function imageUrl(ctx: QueryCtx, ref: string): Promise<string> {
  if (!ref) return "";
  if (ref.startsWith("/") || ref.startsWith("http")) return ref;
  try {
    return (await ctx.storage.getUrl(ref as Id<"_storage">)) ?? "";
  } catch {
    return "";
  }
}

export async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function clamp(s: string, max: number) {
  return s.trim().slice(0, max);
}
