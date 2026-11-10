import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { assertAdmin, sha256Hex } from "./lib";

/*
  Optional guest accounts. Every function here is called only by our own server (never the
  browser) and needs the shared secret, exactly like the admin functions.
*/

const DAY = 86_400_000;
const nightsBetween = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY);

const clean = (s: string, max: number) => s.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
const looksLikeEmail = (e: string) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** A new email-and-password account. The password arrives already hashed by our server. */
export const signUp = mutation({
  args: { secret: v.string(), email: v.string(), name: v.string(), passwordHash: v.string() },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    const email = a.email.trim().toLowerCase();
    if (!looksLikeEmail(email)) return { ok: false as const, reason: "email" };
    const existing = await ctx.db.query("guests").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (existing) return { ok: false as const, reason: "exists" };
    const id = await ctx.db.insert("guests", {
      email,
      name: clean(a.name, 60) || email.split("@")[0],
      passwordHash: a.passwordHash,
      createdAt: Date.now(),
    });
    return { ok: true as const, id };
  },
});

/** For checking a password. Only the server ever sees the hash. */
export const byEmail = query({
  args: { secret: v.string(), email: v.string() },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    const g = await ctx.db
      .query("guests")
      .withIndex("by_email", (q) => q.eq("email", a.email.trim().toLowerCase()))
      .unique();
    return g ? { id: g._id, name: g.name, passwordHash: g.passwordHash ?? null } : null;
  },
});

/** Google sign-in. Google has already verified the email. Links to an existing account by email. */
export const signInWithGoogle = mutation({
  args: { secret: v.string(), googleId: v.string(), email: v.string(), name: v.string() },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    const email = a.email.trim().toLowerCase();
    if (!looksLikeEmail(email) || !a.googleId) return null;
    const byGoogle = await ctx.db.query("guests").withIndex("by_google", (q) => q.eq("googleId", a.googleId)).unique();
    if (byGoogle) return byGoogle._id;
    const byMail = await ctx.db.query("guests").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (byMail) {
      await ctx.db.patch(byMail._id, { googleId: a.googleId });
      return byMail._id;
    }
    return ctx.db.insert("guests", {
      email,
      name: clean(a.name, 60) || email.split("@")[0],
      googleId: a.googleId,
      createdAt: Date.now(),
    });
  },
});

async function savedSlugs(ctx: QueryCtx, guestId: Id<"guests">) {
  const rows = await ctx.db.query("savedStays").withIndex("by_guest", (q) => q.eq("guestId", guestId)).collect();
  return rows.sort((a, b) => b.createdAt - a.createdAt).map((r) => r.slug);
}

const KENYA_OFFSET = 3 * 3_600_000;
const todayKey = () => new Date(Date.now() + KENYA_OFFSET).toISOString().slice(0, 10);
const REVIEW_WINDOW_DAYS = 90;

/**
 * A confirmed stay that has ended and has not been reviewed yet: the one to prompt the guest about.
 * Only stays booked while signed in qualify, and only for a while after checkout.
 */
async function stayToReview(ctx: QueryCtx, guestId: Id<"guests">) {
  const today = todayKey();
  const oldest = new Date(Date.parse(`${today}T00:00:00Z`) - REVIEW_WINDOW_DAYS * DAY).toISOString().slice(0, 10);
  const rows = await ctx.db.query("inquiries").withIndex("by_guest", (q) => q.eq("guestId", guestId)).order("desc").take(30);
  for (const r of rows) {
    if (r.status !== "booked" || r.end >= today || r.end < oldest) continue;
    if (r.reviewInviteId) {
      const invite = await ctx.db.get(r.reviewInviteId);
      if (invite?.used) continue; // already reviewed
    }
    const property = await ctx.db.query("properties").withIndex("by_slug", (q) => q.eq("slug", r.propertySlug)).unique();
    if (!property) continue;
    const unit = property.units.find((u) => u.id === r.unit);
    return {
      inquiryId: r._id,
      slug: r.propertySlug,
      title: property.title,
      unitLabel: property.units.length > 1 ? unit?.label ?? null : null,
      start: r.start,
      end: r.end,
    };
  }
  return null;
}

/** Who is signed in, what they've saved, and a finished stay waiting for a review (if any). */
export const me = query({
  args: { secret: v.string(), id: v.id("guests") },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    const g = await ctx.db.get(a.id);
    if (!g) return null;
    return {
      id: g._id,
      name: g.name,
      email: g.email,
      saved: await savedSlugs(ctx, g._id),
      review: await stayToReview(ctx, g._id),
    };
  },
});

/** The guest chose to review a finished stay: make a one-time review link for it. */
export const startReview = mutation({
  args: { secret: v.string(), id: v.id("guests"), inquiryId: v.id("inquiries"), token: v.string() },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    if (a.token.length < 24) return false;
    const guest = await ctx.db.get(a.id);
    const inquiry = await ctx.db.get(a.inquiryId);
    if (!guest || !inquiry || inquiry.guestId !== a.id || inquiry.status !== "booked" || inquiry.end >= todayKey()) return false;
    if (inquiry.reviewInviteId) {
      const old = await ctx.db.get(inquiry.reviewInviteId);
      if (old?.used) return false; // already reviewed
    }
    const nights = Math.max(1, nightsBetween(inquiry.start, inquiry.end));
    const stayed = new Date(`${inquiry.start}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
    const inviteId = await ctx.db.insert("reviewInvites", {
      tokenHash: await sha256Hex(a.token),
      propertySlug: inquiry.propertySlug,
      unit: inquiry.unit,
      nights,
      stayed,
      guestName: guest.name === guest.email.split("@")[0] ? undefined : guest.name,
      used: false,
      expiresAt: Date.now() + 14 * DAY,
      createdAt: Date.now(),
    });
    await ctx.db.patch(a.inquiryId, { reviewInviteId: inviteId });
    return true;
  },
});

/** Heart or un-heart a stay. Returns whether it is now saved. */
export const toggleSaved = mutation({
  args: { secret: v.string(), id: v.id("guests"), slug: v.string() },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    if (!(await ctx.db.get(a.id))) return null;
    const row = await ctx.db
      .query("savedStays")
      .withIndex("by_guest", (q) => q.eq("guestId", a.id).eq("slug", a.slug))
      .unique();
    if (row) {
      await ctx.db.delete(row._id);
      return false;
    }
    const property = await ctx.db.query("properties").withIndex("by_slug", (q) => q.eq("slug", a.slug)).unique();
    if (!property || !property.published) return null;
    await ctx.db.insert("savedStays", { guestId: a.id, slug: a.slug, createdAt: Date.now() });
    return true;
  },
});

/** The guest's booking inquiries, newest first. */
export const trips = query({
  args: { secret: v.string(), id: v.id("guests") },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    const rows = await ctx.db.query("inquiries").withIndex("by_guest", (q) => q.eq("guestId", a.id)).order("desc").take(50);
    return Promise.all(
      rows.map(async (r) => {
        const property = await ctx.db.query("properties").withIndex("by_slug", (q) => q.eq("slug", r.propertySlug)).unique();
        const unit = property?.units.find((u) => u.id === r.unit);
        return {
          slug: r.propertySlug,
          title: property?.title ?? r.propertySlug,
          unitLabel: property && property.units.length > 1 ? unit?.label ?? null : null,
          start: r.start,
          end: r.end,
          nights: nightsBetween(r.start, r.end),
          guests: r.guests,
          status: r.status,
        };
      }),
    );
  },
});

/** Delete the account and what hangs off it. Past inquiries stay (the host still needs them) but are detached. */
export const deleteAccount = mutation({
  args: { secret: v.string(), id: v.id("guests") },
  handler: async (ctx, a) => {
    assertAdmin(a.secret);
    if (!(await ctx.db.get(a.id))) return;
    for (const r of await ctx.db.query("savedStays").withIndex("by_guest", (q) => q.eq("guestId", a.id)).collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("inquiries").withIndex("by_guest", (q) => q.eq("guestId", a.id)).collect()) {
      await ctx.db.patch(r._id, { guestId: undefined });
    }
    await ctx.db.delete(a.id);
  },
});
