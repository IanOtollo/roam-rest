import { amenityKey, CLOCK_KEY } from "./amenities";
import { isRangeFree, nightsBetween } from "./availability";
import { hasRate, type Property, type Unit } from "./property";

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
  /** Amenity keys the visitor requires (see `amenityKey`). */
  amenities: string[];
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

export interface LocationGroup {
  city: string;
  /** Properties in this city. */
  count: number;
  areas: { area: string; /** The filter value, "Area, City". */ value: string; count: number }[];
}

/** Cities (busiest first), each with its areas, built from the data so new places appear by themselves. */
export function locationGroups(properties: Property[]): LocationGroup[] {
  const cities = new Map<string, LocationGroup>();
  for (const p of properties) {
    const g = cities.get(p.city) ?? { city: p.city, count: 0, areas: [] };
    g.count++;
    const value = `${p.area}, ${p.city}`;
    const a = g.areas.find((x) => x.value === value);
    if (a) a.count++;
    else g.areas.push({ area: p.area, value, count: 1 });
    cities.set(p.city, g);
  }
  return [...cities.values()]
    .map((g) => ({ ...g, areas: g.areas.sort((a, b) => b.count - a.count || a.area.localeCompare(b.area)) }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export interface AmenityOption {
  key: string;
  label: string;
  /** How many properties offer it. */
  count: number;
}

/**
 * Amenity filters worth offering: every amenity that exists on at least one property, most
 * common first. Built from the data, so a new amenity appears here the moment a property has it.
 */
export function amenityOptions(properties: Property[]): AmenityOption[] {
  const map = new Map<string, AmenityOption>();
  for (const p of properties) {
    for (const a of p.amenities) {
      const key = amenityKey(a);
      if (key === CLOCK_KEY) continue; // check-in times aren't something to filter by
      const found = map.get(key);
      if (found) found.count++;
      else map.set(key, { key, label: a.label, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Cheapest first; options with no published rate always go last. */
function byRate(a: Unit, b: Unit) {
  if (!hasRate(a) || !hasRate(b)) return Number(!hasRate(a)) - Number(!hasRate(b));
  return a.nightlyRate - b.nightlyRate;
}

export function priceBounds(properties: Property[]) {
  const rates = properties.flatMap((p) => p.units.filter(hasRate).map((u) => u.nightlyRate));
  return rates.length ? { min: Math.min(...rates), max: Math.max(...rates) } : { min: 0, max: 0 };
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

  const have = new Set(p.amenities.map(amenityKey));
  if (!f.amenities.every((a) => have.has(a))) return null;

  const hasDates = !!(f.start && f.end);
  const nights = hasDates ? nightsBetween(f.start!, f.end!) : 0;
  if (hasDates && nights < p.minNights) return null;

  const fitting = p.units
    .filter((u) => f.guests === 0 || u.maxGuests >= f.guests)
    .filter((u) => u.bedrooms >= f.bedrooms)
    // Options without a published rate stay in the results unless the guest is filtering by price.
    .filter((u) => f.minPrice === null || (hasRate(u) && u.nightlyRate >= f.minPrice))
    .filter((u) => f.maxPrice === null || (hasRate(u) && u.nightlyRate <= f.maxPrice))
    .filter((u) => !hasDates || isRangeFree(p, u.id, f.start!, f.end!))
    .sort(byRate);

  if (fitting.length === 0) return null;
  const unit = fitting[0];
  return { property: p, unit, nights, total: hasDates && hasRate(unit) ? nights * unit.nightlyRate : null };
}

export function filterProperties(properties: Property[], f: Filters): Match[] {
  const matches = properties.map((p) => matchProperty(p, f)).filter((m): m is Match => m !== null);
  if (f.sort === "price-asc") matches.sort((a, b) => byRate(a.unit, b.unit));
  if (f.sort === "price-desc") matches.sort((a, b) =>
      !hasRate(a.unit) || !hasRate(b.unit) ? byRate(a.unit, b.unit) : b.unit.nightlyRate - a.unit.nightlyRate,
    );
  return matches;
}
