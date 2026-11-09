import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { addConfirmedBooking, assertAdmin } from "./lib";

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
    const { secret: _secret, ...booking } = a;
    await addConfirmedBooking(ctx, booking);
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
