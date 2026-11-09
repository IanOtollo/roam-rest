import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
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

/**
 * Adds a confirmed booking (which crosses the nights out on the public calendar). The clash
 * check and the insert run in the caller's single transaction, so two people can never take
 * the same nights. The whole estate clashes with each part; parts clash only with themselves.
 */
export async function addConfirmedBooking(
  ctx: MutationCtx,
  a: { propertySlug: string; unit: string; start: string; end: string; guestName?: string; guestContact?: string; note?: string },
) {
  if (!isIsoDate(a.start) || !isIsoDate(a.end) || a.end <= a.start) {
    throw new ConvexError("Check-out must be after check-in.");
  }
  const property = await ctx.db
    .query("properties")
    .withIndex("by_slug", (q) => q.eq("slug", a.propertySlug))
    .unique();
  if (!property) throw new ConvexError("Property not found.");
  const unit = property.units.find((u) => u.id === a.unit);
  if (!unit) throw new ConvexError("That option doesn't exist for this property.");

  const existing = await ctx.db
    .query("bookings")
    .withIndex("by_property", (q) => q.eq("propertySlug", a.propertySlug))
    .collect();
  for (const b of existing) {
    if (b.status !== "confirmed") continue;
    if (!(b.start < a.end && a.start < b.end)) continue; // the nights don't overlap
    const other = property.units.find((u) => u.id === b.unit);
    const otherCovers = other?.covers ?? [b.unit];
    if (otherCovers.some((c) => unit.covers.includes(c))) {
      throw new ConvexError(`Those dates clash with an existing booking (${b.start} to ${b.end}).`);
    }
  }

  await ctx.db.insert("bookings", {
    propertySlug: a.propertySlug,
    unit: a.unit,
    start: a.start,
    end: a.end,
    status: "confirmed",
    guestName: a.guestName ? clamp(a.guestName, 80) : undefined,
    guestContact: a.guestContact ? clamp(a.guestContact, 80) : undefined,
    note: a.note ? clamp(a.note, 300) : undefined,
    createdAt: Date.now(),
  });
}
