import type { Property } from "./property";

/**
 * Dates are plain "YYYY-MM-DD" strings so there are no timezone surprises.
 * A booking occupies the nights from `start` up to, but not including, `end`
 * (`end` is the checkout morning).
 */
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, n: number) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

export const nightsBetween = (a: string, b: string) =>
  Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);

export const todayKey = () => toKey(new Date());

/** Two units clash when the physical parts they cover overlap. */
function clash(property: Property, a: string, b: string) {
  const ca = property.units.find((u) => u.id === a)?.covers ?? [a];
  const cb = property.units.find((u) => u.id === b)?.covers ?? [b];
  return ca.some((part) => cb.includes(part));
}

export function isNightBooked(property: Property, unit: string, night: string) {
  return property.bookings.some((b) => clash(property, unit, b.unit) && night >= b.start && night < b.end);
}

export function isRangeFree(property: Property, unit: string, start: string, end: string) {
  for (let d = start; d < end; d = addDays(d, 1)) {
    if (isNightBooked(property, unit, d)) return false;
  }
  return true;
}
