import { isRangeFree, nightsBetween } from "./availability";
import type { Amenity, Property, Unit } from "./property";

export type SortKey = "recommended" | "price-asc" | "price-desc";

export interface Filters {
  /** "" = anywhere. Otherwise a city ("Nairobi") or "Area, City" ("Karen, Langata, Nairobi"). */
  where: string;
  start: string | null;
  end: string | null;
  /** 0 = not specified. */
  guests: number;
  minPrice: number | null;
  maxPrice: number | null;
  /** Minimum bedrooms, 0 = any. */
  bedrooms: number;
  amenities: Amenity["icon"][];
  sort: SortKey;
}

export const emptyFilters: Filters = {
  where: "",
  start: null,
  end: null,
  guests: 0,
  minPrice: null,
  maxPrice: null,
  bedrooms: 0,
  amenities: [],
  sort: "recommended",
};

export const amenityLabels: Record<Amenity["icon"], string> = {
  wifi: "WiFi",
  kitchen: "Kitchen",
  pool: "Pool",
  parking: "Free parking",
  ensuite: "En-suite rooms",
  clock: "Flexible check-in",
};

/** A property that passed every filter, with the best-fitting unit to show on its card. */
export interface Match {
  property: Property;
  /** Cheapest unit that satisfies every unit-level filter. */
  unit: Unit;
  nights: number;
  /** Total for the chosen dates, or null when no dates are picked. */
  total: number | null;
}

export function locationOptions(properties: Property[]): string[] {
  const out = new Set<string>();
  for (const p of properties) {
    out.add(`${p.area}, ${p.city}`);
    out.add(p.city);
  }
  return [...out];
}

/** Amenity filters worth offering: those that exist on at least one property. */
export function amenityOptions(properties: Property[]): Amenity["icon"][] {
  const set = new Set<Amenity["icon"]>();
  for (const p of properties) for (const a of p.amenities) if (a.icon !== "clock") set.add(a.icon);
  return [...set];
}

export function priceBounds(properties: Property[]) {
  const rates = properties.flatMap((p) => p.units.map((u) => u.nightlyRate));
  return { min: Math.min(...rates), max: Math.max(...rates) };
}

export function maxBedrooms(properties: Property[]) {
  return Math.max(...properties.flatMap((p) => p.units.map((u) => u.bedrooms)));
}

export function maxGuests(properties: Property[]) {
  return Math.max(...properties.map((p) => p.maxGuests));
}

/** Number of filter groups currently narrowing the results (shown on the Filters button). */
export function activeFilterCount(f: Filters) {
  return (
    (f.where !== "" ? 1 : 0) +
    (f.start && f.end ? 1 : 0) +
    (f.guests > 0 ? 1 : 0) +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.bedrooms > 0 ? 1 : 0) +
    f.amenities.length
  );
}

export function anyFilterActive(f: Filters) {
  return activeFilterCount(f) > 0 || f.start !== null || f.end !== null;
}

function matchProperty(p: Property, f: Filters): Match | null {
  if (f.where && f.where !== p.city && f.where !== `${p.area}, ${p.city}`) return null;

  const have = new Set(p.amenities.map((a) => a.icon));
  if (!f.amenities.every((a) => have.has(a))) return null;

  const hasDates = !!(f.start && f.end);
  const nights = hasDates ? nightsBetween(f.start!, f.end!) : 0;
  if (hasDates && nights < p.minNights) return null;

  const fitting = p.units
    .filter((u) => f.guests === 0 || u.maxGuests >= f.guests)
    .filter((u) => u.bedrooms >= f.bedrooms)
    .filter((u) => f.minPrice === null || u.nightlyRate >= f.minPrice)
    .filter((u) => f.maxPrice === null || u.nightlyRate <= f.maxPrice)
    .filter((u) => !hasDates || isRangeFree(p, u.id, f.start!, f.end!))
    .sort((a, b) => a.nightlyRate - b.nightlyRate);

  if (fitting.length === 0) return null;
  const unit = fitting[0];
  return { property: p, unit, nights, total: hasDates ? nights * unit.nightlyRate : null };
}

export function filterProperties(properties: Property[], f: Filters): Match[] {
  const matches = properties.map((p) => matchProperty(p, f)).filter((m): m is Match => m !== null);
  if (f.sort === "price-asc") matches.sort((a, b) => a.unit.nightlyRate - b.unit.nightlyRate);
  if (f.sort === "price-desc") matches.sort((a, b) => b.unit.nightlyRate - a.unit.nightlyRate);
  return matches;
}
