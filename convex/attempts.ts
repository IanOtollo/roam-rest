import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib";

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60_000;
const WINDOW_MS = 15 * 60_000;

/** Admin-login rate limiting. Called only by our own server, never the browser. */
export const status = query({
  args: { secret: v.string(), key: v.string() },
  handler: async (ctx, { secret, key }) => {
    assertAdmin(secret);
    const row = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const now = Date.now();
    if (row && row.lockedUntil > now) return { locked: true, retryAfterMs: row.lockedUntil - now };
    return { locked: false, retryAfterMs: 0 };
  },
});

export const fail = mutation({
  args: { secret: v.string(), key: v.string() },
  handler: async (ctx, { secret, key }) => {
    assertAdmin(secret);
    const now = Date.now();
    const row = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!row) {
      await ctx.db.insert("loginAttempts", { key, failures: 1, lockedUntil: 0, updatedAt: now });
      return;
    }
    // Failures older than the window don't count against the visitor.
    const failures = now - row.updatedAt > WINDOW_MS ? 1 : row.failures + 1;
    await ctx.db.patch(row._id, {
      failures,
      lockedUntil: failures >= MAX_FAILURES ? now + LOCK_MS : row.lockedUntil,
      updatedAt: now,
    });
  },
});

export const clear = mutation({
  args: { secret: v.string(), key: v.string() },
  handler: async (ctx, { secret, key }) => {
    assertAdmin(secret);
    const row = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});
