import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { propertyInput } from "./schema";
import { assertAdmin, imageUrl, todayIso } from "./lib";

/** The shape the website uses (see `Property` in src/lib/property.ts), with image URLs resolved. */
async function toPublic(ctx: QueryCtx, p: Doc<"properties">) {
  const [bookings, reviews] = await Promise.all([
    ctx.db
      .query("bookings")
      .withIndex("by_property", (q) => q.eq("propertySlug", p.slug))
      .collect(),
    ctx.db
      .query("reviews")
      .withIndex("by_property", (q) => q.eq("propertySlug", p.slug).eq("status", "published"))
      .collect(),
  ]);
  const today = todayIso();

  return {
    slug: p.slug,
    previousSlugs: p.previousSlugs ?? [],
    title: p.title,
    tagline: p.tagline,
    area: p.area,
    city: p.city,
    locationNote: p.locationNote,
    locationBlurb: p.locationBlurb,
    maxGuests: p.maxGuests,
    minNights: p.minNights,
    checkIn: p.checkIn,
    checkOut: p.checkOut,
    highlights: p.highlights,
    cover: await imageUrl(ctx, p.cover),
    units: await Promise.all(p.units.map(async (u) => ({ ...u, cover: await imageUrl(ctx, u.cover) }))),
    amenities: p.amenities,
    walkthrough: await Promise.all(p.walkthrough.map(async (r) => ({ ...r, src: await imageUrl(ctx, r.src) }))),
    heroImages: {
      back: { ...p.heroImages.back, src: await imageUrl(ctx, p.heroImages.back.src) },
      main: { ...p.heroImages.main, src: await imageUrl(ctx, p.heroImages.main.src) },
      front: { ...p.heroImages.front, src: await imageUrl(ctx, p.heroImages.front.src) },
    },
    // Guests only ever see the dates, never who booked.
    bookings: bookings
      .filter((b) => b.status === "confirmed" && b.end >= today)
      .map((b) => ({ unit: b.unit, start: b.start, end: b.end })),
    reviews: reviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => ({ id: r._id, author: r.author, stayed: r.stayed, nights: r.nights, unit: r.unit, quote: r.quote })),
  };
}

/* ------------------------------------------------------------------ public */

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("properties").withIndex("by_order").collect();
    return Promise.all(docs.filter((p) => p.published).map((p) => toPublic(ctx, p)));
  },
});

/** How many property records exist at all (published or not). Lets the site tell "empty" from "all hidden". */
export const publicCount = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("properties").collect()).length,
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return p && p.published ? toPublic(ctx, p) : null;
  },
});

/* ------------------------------------------------------------------- admin */

export const adminList = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertAdmin(secret);
    const docs = await ctx.db.query("properties").withIndex("by_order").collect();
    return Promise.all(
      docs.map(async (p) => ({
        ...p,
        coverUrl: await imageUrl(ctx, p.cover),
      })),
    );
  },
});

/** One property for the editor, plus a lookup from every image reference to a displayable URL. */
export const adminGet = query({
  args: { secret: v.string(), slug: v.string() },
  handler: async (ctx, { secret, slug }) => {
    assertAdmin(secret);
    const p = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p) return null;
    const refs = new Set<string>([
      p.cover,
      ...p.units.map((u) => u.cover),
      ...p.walkthrough.map((r) => r.src),
      p.heroImages.back.src,
      p.heroImages.main.src,
      p.heroImages.front.src,
    ]);
    const urls: Record<string, string> = {};
    for (const ref of refs) urls[ref] = await imageUrl(ctx, ref);
    return { property: p, urls };
  },
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const upsert = mutation({
  args: { secret: v.string(), property: propertyInput },
  handler: async (ctx, { secret, property }) => {
    assertAdmin(secret);
    if (!SLUG.test(property.slug) || property.slug.length > 60) {
      throw new ConvexError("The web address must use lowercase letters, numbers and dashes only.");
    }
    if (property.title.trim().length < 2) throw new ConvexError("Please give the property a name.");
    if (property.units.length === 0) throw new ConvexError("Add at least one bookable option (for example, Entire house).");
    const ids = new Set(property.units.map((u) => u.id));
    if (ids.size !== property.units.length) throw new ConvexError("Each option needs a different short id.");
    for (const u of property.units) {
      if (u.nightlyRate <= 0 || u.maxGuests <= 0) throw new ConvexError(`"${u.label}" needs a price and a guest limit.`);
    }
    if (property.minNights < 1) throw new ConvexError("The minimum stay must be at least 1 night.");

    const existing = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", property.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...property, updatedAt: Date.now() });
      return { slug: property.slug, created: false };
    }
    const all = await ctx.db.query("properties").collect();
    const sortOrder = all.reduce((m, p) => Math.max(m, p.sortOrder), 0) + 1;
    await ctx.db.insert("properties", { ...property, published: false, sortOrder, updatedAt: Date.now() });
    return { slug: property.slug, created: true };
  },
});

/**
 * Changes a property's web address. Everything that points at the old address (bookings,
 * reviews, review links) moves with it in the same transaction, so nothing is ever left
 * orphaned. The old address is remembered so the website can redirect old links.
 */
export const rename = mutation({
  args: { secret: v.string(), from: v.string(), to: v.string() },
  handler: async (ctx, { secret, from, to }) => {
    assertAdmin(secret);
    if (!SLUG.test(to) || to.length > 60) {
      throw new ConvexError("The web address must use lowercase letters, numbers and dashes only.");
    }
    if (from === to) return;

    const p = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", from))
      .unique();
    if (!p) throw new ConvexError("Property not found.");

    const all = await ctx.db.query("properties").collect();
    if (all.some((x) => x._id !== p._id && (x.slug === to || (x.previousSlugs ?? []).includes(to)))) {
      throw new ConvexError("That web address is already used by another property.");
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_property", (q) => q.eq("propertySlug", from))
      .collect();
    for (const b of bookings) await ctx.db.patch(b._id, { propertySlug: to });

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_property", (q) => q.eq("propertySlug", from))
      .collect();
    for (const r of reviews) await ctx.db.patch(r._id, { propertySlug: to });

    const invites = await ctx.db.query("reviewInvites").collect();
    for (const i of invites) if (i.propertySlug === from) await ctx.db.patch(i._id, { propertySlug: to });

    await ctx.db.patch(p._id, {
      slug: to,
      previousSlugs: Array.from(new Set([...(p.previousSlugs ?? []), from])).filter((s) => s !== to),
      updatedAt: Date.now(),
    });
  },
});

export const setPublished = mutation({
  args: { secret: v.string(), slug: v.string(), published: v.boolean() },
  handler: async (ctx, { secret, slug, published }) => {
    assertAdmin(secret);
    const p = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p) throw new ConvexError("Property not found.");
    await ctx.db.patch(p._id, { published, updatedAt: Date.now() });
  },
});

/** Swaps this property's position with its neighbour so the owner can order the carousel and grid. */
export const move = mutation({
  args: { secret: v.string(), slug: v.string(), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, { secret, slug, direction }) => {
    assertAdmin(secret);
    const all = await ctx.db.query("properties").withIndex("by_order").collect();
    const i = all.findIndex((p) => p.slug === slug);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= all.length) return;
    await ctx.db.patch(all[i]._id, { sortOrder: all[j].sortOrder });
    await ctx.db.patch(all[j]._id, { sortOrder: all[i].sortOrder });
  },
});

/** Permanently removes a property with its bookings, reviews and invites. */
export const remove = mutation({
  args: { secret: v.string(), slug: v.string() },
  handler: async (ctx, { secret, slug }) => {
    assertAdmin(secret);
    const p = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p) return;
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_property", (q) => q.eq("propertySlug", slug))
      .collect();
    for (const b of bookings) await ctx.db.delete(b._id);
    const reviews = await ctx.db.query("reviews").collect();
    for (const r of reviews) if (r.propertySlug === slug) await ctx.db.delete(r._id);
    const invites = await ctx.db.query("reviewInvites").collect();
    for (const i of invites) if (i.propertySlug === slug) await ctx.db.delete(i._id);
    await ctx.db.delete(p._id);
  },
});

/** A short-lived URL the admin's browser uploads a photo to. */
export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertAdmin(secret);
    return await ctx.storage.generateUploadUrl();
  },
});
