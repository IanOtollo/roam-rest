import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin, clamp, isIsoDate } from "./lib";

export const adminList = query({
  args: { secret: v.string(), propertySlug: v.optional(v.string()) },
  handler: async (ctx, { secret, propertySlug }) => {
    assertAdmin(secret);
    const all = propertySlug
      ? await ctx.db
          .query("bookings")
          .withIndex("by_property", (q) => q.eq("propertySlug", propertySlug))
          .collect()
      : await ctx.db.query("bookings").collect();
    return all.sort((a, b) => (a.start < b.start ? 1 : -1));
  },
});

/**
 * Adds a confirmed booking or blocks dates. The clash check and the insert run in one
 * transaction, so two people can never take the same nights. The whole estate clashes with
 * each part, and the parts clash only with themselves (see `covers` on each unit).
 */
export const create = mutation({
  args: {
    secret: v.string(),
    propertySlug: v.string(),
    unit: v.string(),
    start: v.string(),
    end: v.string(),
    guestName: v.optional(v.string()),
    guestContact: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
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
  },
});

/** Frees the dates again but keeps the record. */
export const cancel = mutation({
  args: { secret: v.string(), id: v.id("bookings") },
  handler: async (ctx, { secret, id }) => {
    assertAdmin(secret);
    await ctx.db.patch(id, { status: "cancelled" });
  },
});

export const remove = mutation({
  args: { secret: v.string(), id: v.id("bookings") },
  handler: async (ctx, { secret, id }) => {
    assertAdmin(secret);
    await ctx.db.delete(id);
  },
});
