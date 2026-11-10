/**
 * Festive seasons. They switch on and off by themselves with the calendar (Kenya time), so nothing
 * needs changing by hand. Add ?season=halloween, ?season=diwali, ?season=christmas or ?season=newyear
 * to any page to preview one out of season, or ?season=off to see the plain site.
 */

export type Season = "halloween" | "diwali" | "christmas" | "newyear";

export const SEASONS: Record<Season, { label: string }> = {
  halloween: { label: "Halloween" },
  diwali: { label: "Diwali" },
  christmas: { label: "Christmas" },
  newyear: { label: "New Year" },
};

/**
 * Diwali moves with the lunar calendar, so it needs real dates (the main day, Lakshmi Puja, in India).
 * Add the next years here as they are published. Years that are missing simply have no Diwali.
 */
const DIWALI: Record<number, string> = {
  2026: "2026-11-08",
  2027: "2027-10-29",
  2028: "2028-10-17",
  2029: "2029-11-05",
  2030: "2030-10-26",
  2031: "2031-10-26",
};
const DIWALI_BEFORE = 3; // Dhanteras opens the festival about three days earlier
const DIWALI_AFTER = 2; // and it runs on to Bhai Dooj

/** Today's calendar date in Nairobi, as a number of days (so dates can be compared). */
function nairobiDay(now: Date): { m: number; d: number; y: number; days: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const [y, m, d] = [get("year"), get("month"), get("day")];
  return { y, m, d, days: Math.round(Date.UTC(y, m - 1, d) / 86_400_000) };
}

/** Which season it is today, or null. Diwali, being short and exact, wins over Halloween if they overlap. */
export function seasonFor(now: Date = new Date()): Season | null {
  const { y, m, d, days } = nairobiDay(now);
  const diwali = DIWALI[y];
  if (diwali) {
    const dd = Math.round(Date.parse(`${diwali}T00:00:00Z`) / 86_400_000);
    if (days >= dd - DIWALI_BEFORE && days <= dd + DIWALI_AFTER) return "diwali";
  }
  if (m === 10 && d === 31) return "halloween"; // the one night: 31 Oct
  if (m === 12 && d >= 15 && d <= 26) return "christmas"; // 15 to 26 Dec
  if ((m === 12 && d >= 27) || (m === 1 && d <= 5)) return "newyear"; // 27 Dec to 5 Jan
  return null;
}

/** A season forced through the address bar, for previews. "off" forces none. */
export function seasonFromUrl(search: string): Season | null | undefined {
  const v = new URLSearchParams(search).get("season");
  if (v === "off") return null;
  return v === "halloween" || v === "diwali" || v === "christmas" || v === "newyear" ? v : undefined;
}

const KEY = "rr_festive_off";
export const FESTIVE_EVENT = "rr-festive";

/** Visitors can switch the effects off; the choice stays in their browser. */
export function festiveEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "1";
  } catch {
    return true;
  }
}

export function setFestiveEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, "1");
  } catch {
    /* the switch still works for this page view */
  }
  window.dispatchEvent(new Event(FESTIVE_EVENT));
}
