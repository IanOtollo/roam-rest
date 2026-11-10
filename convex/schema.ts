import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Image references are either a site path ("/images/x.jpg") or a Convex storage id. */
export const unitValidator = v.object({
  id: v.string(),
  label: v.string(),
  tab: v.string(),
  covers: v.array(v.string()),
  bedrooms: v.number(),
  beds: v.number(),
  bathrooms: v.number(),
  maxGuests: v.number(),
  nightlyRate: v.number(),
  note: v.string(),
  cover: v.string(),
});

/**
 * Any amenity: one from the catalog (src/lib/amenities.ts) or a custom one the owner adds.
 * `key` is its stable identity (used by search filters); older records have only `icon`.
 */
export const amenityValidator = v.object({
  key: v.optional(v.string()),
  icon: v.string(),
  label: v.string(),
  detail: v.string(),
});

export const roomValidator = v.object({ src: v.string(), title: v.string(), where: v.string() });
export const heroImageValidator = v.object({ src: v.string(), alt: v.string() });

/** Everything an admin edits about a property (the rest is bookkeeping). */
export const propertyInput = v.object({
  slug: v.string(),
  title: v.string(),
  tagline: v.string(),
  area: v.string(),
  city: v.string(),
  locationNote: v.string(),
  locationBlurb: v.string(),
  maxGuests: v.number(),
  minNights: v.number(),
  checkIn: v.string(),
  checkOut: v.string(),
  highlights: v.array(v.string()),
  units: v.array(unitValidator),
  amenities: v.array(amenityValidator),
  walkthrough: v.array(roomValidator),
  heroImages: v.object({ back: heroImageValidator, main: heroImageValidator, front: heroImageValidator }),
  cover: v.string(),
});

export default defineSchema({
  properties: defineTable({
    ...propertyInput.fields,
    published: v.boolean(),
    sortOrder: v.number(),
    updatedAt: v.number(),
    /** Earlier web addresses of this property; the site redirects them to the current one. */
    previousSlugs: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["sortOrder"]),

  /** Confirmed stays (and blocked dates). `end` is the checkout morning. */
  bookings: defineTable({
    propertySlug: v.string(),
    unit: v.string(),
    start: v.string(),
    end: v.string(),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
    guestName: v.optional(v.string()),
    guestContact: v.optional(v.string()),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_property", ["propertySlug", "start"]),

  reviews: defineTable({
    propertySlug: v.string(),
    unit: v.string(),
    author: v.string(),
    stayed: v.string(),
    nights: v.number(),
    quote: v.string(),
    rating: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("published"), v.literal("hidden")),
    createdAt: v.number(),
  })
    .index("by_property", ["propertySlug", "status"])
    .index("by_status", ["status"]),

  /** One-time links sent to guests after checkout. Only a hash of the token is stored. */
  reviewInvites: defineTable({
    tokenHash: v.string(),
    propertySlug: v.string(),
    unit: v.string(),
    nights: v.number(),
    stayed: v.string(),
    guestName: v.optional(v.string()),
    used: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["tokenHash"]),

  /**
   * A guest tapped "Reserve on WhatsApp" with dates chosen. The host gets an email with two
   * buttons; "booked" turns this into a confirmed booking (dates crossed out), "declined" just
   * closes it. Only a hash of the email-button token is stored.
   */
  inquiries: defineTable({
    tokenHash: v.string(),
    ipHash: v.string(),
    propertySlug: v.string(),
    unit: v.string(),
    start: v.string(),
    end: v.string(),
    guests: v.number(),
    status: v.union(v.literal("pending"), v.literal("booked"), v.literal("declined")),
    createdAt: v.number(),
    decidedAt: v.optional(v.number()),
    /** Set when a signed-in guest made the inquiry, so it shows under "My bookings". */
    guestId: v.optional(v.id("guests")),
    /** The review link created for this stay, once the guest chose to leave a review. */
    reviewInviteId: v.optional(v.id("reviewInvites")),
  })
    .index("by_guest", ["guestId", "createdAt"])
    .index("by_token", ["tokenHash"])
    .index("by_ip", ["ipHash", "createdAt"])
    .index("by_created", ["createdAt"]),

  /** Optional guest accounts. Booking never needs one. Only a salted hash of the password is kept. */
  guests: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
    googleId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_google", ["googleId"]),

  /** A guest's saved (hearted) stays. */
  savedStays: defineTable({
    guestId: v.id("guests"),
    slug: v.string(),
    createdAt: v.number(),
  }).index("by_guest", ["guestId", "slug"]),

  /** Failed admin-login tracking, keyed by a hash of the visitor's IP (never the IP itself). */
  loginAttempts: defineTable({
    key: v.string(),
    failures: v.number(),
    lockedUntil: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
