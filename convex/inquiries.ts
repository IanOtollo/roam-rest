import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { addConfirmedBooking, assertAdmin, isIsoDate, sha256Hex } from "./lib";

const TEN_MIN = 10 * 60_000;
const DAY = 86_400_000;
const PER_VISITOR = 6; // inquiries per visitor per 10 minutes
const PER_DAY = 60; // whole site per day, so a flood can never exhaust the email quota

const nightsBetween = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY);

/** Called by our own server when a guest taps Reserve on WhatsApp. Never by the browser directly. */
export const create = mutation({
  args: {
    secret: v.string(),
    token: v.string(),
    ipHash: v.string(),
    propertySlug: v.string(),
    unit: v.string(),
    start: v.string(),
    end: v.string(),
    guests: v.number(),
  },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    if (a.token.length < 24) return { ok: false as const, reason: "invalid" };
    if (!isIsoDate(a.start) || !isIsoDate(a.end) || a.end <= a.start) return { ok: false as const, reason: "invalid" };
    const guests = Math.round(a.guests);
    if (!(guests >= 1 && guests <= 100)) return { ok: false as const, reason: "invalid" };

    const property = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", a.propertySlug))
      .unique();
    const unit = property?.units.find((u) => u.id === a.unit);
    if (!property || !property.published || !unit) return { ok: false as const, reason: "invalid" };

    const now = Date.now();
    const recent = await ctx.db
      .query("inquiries")
      .withIndex("by_ip", (q) => q.eq("ipHash", a.ipHash).gt("createdAt", now - TEN_MIN))
      .collect();
    if (recent.length >= PER_VISITOR) return { ok: false as const, reason: "rate" };
    // Tapping the button twice for the same stay should not send two emails.
    if (recent.some((r) => r.propertySlug === a.propertySlug && r.unit === a.unit && r.start === a.start && r.end === a.end)) {
      return { ok: false as const, reason: "duplicate" };
    }
    const today = await ctx.db
      .query("inquiries")
      .withIndex("by_created", (q) => q.gt("createdAt", now - DAY))
      .take(PER_DAY);
    if (today.length >= PER_DAY) return { ok: false as const, reason: "rate" };

    await ctx.db.insert("inquiries", {
      tokenHash: await sha256Hex(a.token),
      ipHash: a.ipHash,
      propertySlug: a.propertySlug,
      unit: a.unit,
      start: a.start,
      end: a.end,
      guests,
      status: "pending",
      createdAt: now,
    });
    return {
      ok: true as const,
      propertyTitle: property.title,
      area: `${property.area}, ${property.city}`,
      unitLabel: unit.label,
      showUnit: property.units.length > 1,
      nightlyRate: unit.nightlyRate,
      nights: nightsBetween(a.start, a.end),
    };
  },
});

async function describe(ctx: QueryCtx, row: { propertySlug: string; unit: string; start: string; end: string; guests: number; status: "pending" | "booked" | "declined"; createdAt: number }) {
  const property = await ctx.db
    .query("properties")
    .withIndex("by_slug", (q) => q.eq("slug", row.propertySlug))
    .unique();
  const unit = property?.units.find((u) => u.id === row.unit);
  return {
    propertyTitle: property?.title ?? row.propertySlug,
    unitLabel: unit?.label ?? row.unit,
    showUnit: (property?.units.length ?? 0) > 1,
    start: row.start,
    end: row.end,
    nights: nightsBetween(row.start, row.end),
    guests: row.guests,
    status: row.status,
    createdAt: row.createdAt,
  };
}

/** What the confirmation page shows before the host presses a button. */
export const preview = query({
  args: { secret: v.string(), token: v.string() },
  handler: async (ctx, { secret, token }) => {
    assertAdmin(secret);
    if (token.length < 24) return null;
    const tokenHash = await sha256Hex(token);
    const row = await ctx.db
      .query("inquiries")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    return row ? await describe(ctx, row) : null;
  },
});

/**
 * The host's answer. "booked" records a confirmed booking, so the nights are crossed out on the
 * public calendar (and it fails safely if they now clash with another booking). "declined" only
 * closes the inquiry. Pressing a button twice, or the other one afterwards, changes nothing.
 */
export const decide = mutation({
  args: { secret: v.string(), token: v.string(), decision: v.union(v.literal("booked"), v.literal("declined")) },
  handler: async (ctx, { secret, token, decision }) => {
    assertAdmin(secret);
    if (token.length < 24) return { status: "missing" as const };
    const tokenHash = await sha256Hex(token);
    const row = await ctx.db
      .query("inquiries")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!row) return { status: "missing" as const };
    if (row.status !== "pending") return { status: row.status };
    if (decision === "booked") {
      await addConfirmedBooking(ctx, {
        propertySlug: row.propertySlug,
        unit: row.unit,
        start: row.start,
        end: row.end,
        note: "Confirmed from a website inquiry email.",
      });
    }
    await ctx.db.patch(row._id, { status: decision, decidedAt: Date.now() });
    return { status: decision };
  },
});
