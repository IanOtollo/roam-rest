/**
 * Roam & Rest is a multi-property platform. Every stay is one entry in
 * `properties` below. To launch a new property: add photos under
 * /public/images/<slug>/ and append an entry here. Pages, cards, calendar and
 * booking panel are all generated from this data.
 *
 * Items marked CONFIRM are placeholders that must be verified with the host.
 */

export const brand = {
  name: "Roam & Rest",
  tagline: "Hand-picked homes, hosted with care.",
  /** CONFIRM: registered business name, as it should appear in legal notices. */
  legalName: "Roam & Rest",
  /** Host's WhatsApp number, international format, digits only. */
  whatsapp: "254708443090",
  /** Public contact email. Leave empty to hide it everywhere. */
  email: "patkui@gmail.com",
  /** Phone / bookings, as displayed and as a tel: link. */
  phone: "0708443090",
  phoneLink: "+254708443090",
  /** Social handles, without the @. */
  instagram: "triciangugi",
  tiktok: "patkui",
  region: "Nairobi, Kenya",
  currency: "KES",
} as const;

export interface Booking {
  /** Unit id this booking occupies. */
  unit: string;
  /** First night, "YYYY-MM-DD". */
  start: string;
  /** Checkout morning (exclusive), "YYYY-MM-DD". */
  end: string;
}

export interface Unit {
  id: string;
  /** Full name, e.g. "The Cottage". */
  label: string;
  /** Short caption for the switcher, e.g. "Cottage". */
  tab: string;
  /**
   * Physical parts this unit occupies. Two units clash when their `covers`
   * overlap, so the whole estate (cottage + main) clashes with both.
   */
  covers: string[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  /** Nightly rate in KES. */
  nightlyRate: number;
  note: string;
  cover: string;
}

export interface Amenity {
  icon: "wifi" | "kitchen" | "pool" | "parking" | "ensuite" | "clock";
  label: string;
  detail: string;
}

export interface WalkthroughRoom {
  src: string;
  title: string;
  where: string;
}

export interface Review {
  id: string;
  author: string;
  /** e.g. "Oct 2026". Only guests with a completed booking can appear. */
  stayed: string;
  nights: number;
  unit: string;
  quote: string;
}

export interface HeroImage {
  src: string;
  alt: string;
}

export interface Property {
  slug: string;
  /** Earlier web addresses; they redirect to the current one. */
  previousSlugs?: string[];
  title: string;
  tagline: string;
  area: string;
  city: string;
  locationNote: string;
  locationBlurb: string;
  maxGuests: number;
  minNights: number;
  checkIn: string;
  checkOut: string;
  /** Short chips for the hero, e.g. "Private pool". */
  highlights: string[];
  /** First unit is the default selection. */
  units: Unit[];
  amenities: Amenity[];
  walkthrough: WalkthroughRoom[];
  heroImages: { back: HeroImage; main: HeroImage; front: HeroImage };
  cover: string;
  /** Empty until real guests have stayed; the section stays hidden meanwhile. */
  reviews: Review[];
  /** Confirmed stays; their dates show as taken in the calendar. */
  bookings: Booking[];
  /** False when live availability couldn't be loaded (the site then asks guests to confirm by message). */
  availabilityKnown?: boolean;
}

export const properties: Property[] = [
  {
    slug: "karen-estate",
    /** CONFIRM: working title for the Karen property. */
    title: "The Karen Estate",
    tagline: "A house that lives like a gallery.",
    area: "Karen, Langata",
    city: "Nairobi",
    locationNote: "The exact address is shared once your booking is confirmed.",
    locationBlurb: "A quiet, leafy corner of Karen-Langata, with free parking on the property.",
    maxGuests: 10,
    minNights: 2,
    checkIn: "14:00",
    checkOut: "10:00",
    highlights: ["Private pool"],
    cover: "/images/hall-trusses.jpg",
    units: [
      {
        id: "whole",
        label: "The Whole Estate",
        tab: "Entire",
        covers: ["main", "cottage"],
        bedrooms: 5,
        beds: 5,
        bathrooms: 5.5,
        maxGuests: 10,
        nightlyRate: 42000, // CONFIRM
        note: "Main house and cottage together, with the pool all to yourselves.",
        cover: "/images/pool-house.jpg",
      },
      {
        id: "main",
        label: "The Main House",
        tab: "Main house",
        covers: ["main"],
        bedrooms: 3,
        beds: 3,
        bathrooms: 3.5,
        maxGuests: 6, // CONFIRM
        nightlyRate: 28000, // CONFIRM
        note: "Vaulted great hall, fireplace and three en-suite bedrooms.",
        cover: "/images/hall-fireplace.jpg",
      },
      {
        id: "cottage",
        label: "The Cottage",
        tab: "Cottage",
        covers: ["cottage"],
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        maxGuests: 4, // CONFIRM
        nightlyRate: 18000, // CONFIRM
        note: "A complete house of its own, with a private kitchen.",
        cover: "/images/cottage-bed-sculpted.jpg",
      },
    ],
    amenities: [
      { icon: "wifi", label: "WiFi", detail: "Throughout the property" },
      { icon: "kitchen", label: "Kitchen", detail: "Fully equipped; the cottage has its own" },
      { icon: "pool", label: "Pool", detail: "Private, set in the courtyard" },
      { icon: "parking", label: "Free parking", detail: "On the premises" },
      { icon: "ensuite", label: "All rooms en-suite", detail: "Every bedroom has its own bathroom" },
      { icon: "clock", label: "Check-in 14:00", detail: "Check-out by 10:00" },
    ],
    heroImages: {
      back: { src: "/images/pool-house.jpg", alt: "The courtyard pool" },
      main: {
        src: "/images/hall-trusses.jpg",
        alt: "The vaulted great hall with whitewashed trusses and a sculpted fireplace",
      },
      front: { src: "/images/suite-kilim.jpg", alt: "A suite with a pointed plaster headboard and kilim rug" },
    },
    walkthrough: [
      { src: "/images/pool-house.jpg", title: "The courtyard", where: "Pool & terrace" },
      { src: "/images/hall-trusses.jpg", title: "The great hall", where: "Main house" },
      { src: "/images/hall-fireplace.jpg", title: "The hearth", where: "Main house" },
      { src: "/images/hall-dining.jpg", title: "The long table", where: "Main house" },
      { src: "/images/hall-nook.jpg", title: "The red alcove", where: "Main house" },
      { src: "/images/suite-kilim.jpg", title: "The kilim suite", where: "Main house" },
      { src: "/images/suite-leopard.jpg", title: "The leopard suite", where: "Main house" },
      { src: "/images/cottage-bed-sculpted.jpg", title: "The canopy bed", where: "Cottage" },
      { src: "/images/cottage-living.jpg", title: "The garden room", where: "Cottage" },
      { src: "/images/pool-edge.jpg", title: "The pool, at noon", where: "Courtyard" },
    ],
    reviews: [],
    /**
     * Real bookings only; dates listed here show as crossed out in the calendar and are
     * hidden from search. Add one per confirmed stay, e.g.
     * { unit: "main", start: "2026-12-18", end: "2027-01-03" }   (end = checkout morning)
     */
    bookings: [],
  },
];

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);

export const startingRate = (p: Property) => Math.min(...p.units.map((u) => u.nightlyRate));

export const getUnit = (p: Property, id: string) => p.units.find((u) => u.id === id) ?? p.units[0];
