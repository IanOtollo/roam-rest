import { properties as seed, type Property } from "./property";

/**
 * The single place pages read property data from.
 *
 *  - Convex configured:  read the live data (what the owner edits in /admin) through Next's
 *    data cache: reused for up to 30 seconds, and cleared the moment the owner saves a change
 *    (`revalidateTag("properties")`), so pages stay fast and a brief Convex hiccup doesn't
 *    reach visitors.
 *  - Convex unreachable: serve the last data we successfully loaded. If there is none yet,
 *    serve the built-in starter property with `availabilityKnown: false`, so the site never
 *    claims dates are free when it can't tell.
 *  - Convex not configured: serve the built-in starter property (local preview).
 *
 * Why a plain `fetch` and not Convex's own client: the client always sends `cache: no-store`,
 * and Next refuses to cache (or ever refresh) anything that does, so the data would go stale
 * forever on a production build.
 */

export const PROPERTIES_TAG = "properties";
const REVALIDATE_SECONDS = 30;

const configured = () => !!process.env.NEXT_PUBLIC_CONVEX_URL;

let lastGood: Property[] | null = null;

async function convexQuery<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Convex-Client": "roam-and-rest-site" },
    body: JSON.stringify({ path, format: "json", args: {} }),
    next: { revalidate: REVALIDATE_SECONDS, tags: [PROPERTIES_TAG] },
  });
  if (!res.ok) throw new Error(`Convex responded ${res.status}`);
  const body = (await res.json()) as { status: string; value?: T; errorMessage?: string };
  if (body.status !== "success") throw new Error(body.errorMessage ?? "Convex query failed");
  return body.value as T;
}

const unknownAvailability = (list: Property[]): Property[] =>
  list.map((p) => ({ ...p, bookings: [], availabilityKnown: false }));

export async function getProperties(): Promise<Property[]> {
  if (!configured()) return seed;
  try {
    const data = await convexQuery<Property[]>("properties:list");
    // A brand-new database has nothing yet: the starter is shown until the owner imports it.
    if (data.length === 0 && (await convexQuery<number>("properties:publicCount")) === 0) return seed;
    lastGood = data;
    return data;
  } catch {
    return lastGood ?? unknownAvailability(seed);
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  return (await getProperties()).find((p) => p.slug === slug);
}
