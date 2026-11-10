import { NextResponse } from "next/server";
import { currentGuest } from "@/lib/guest/server";
import { getProperties } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Who is signed in (their name, email and saved stays, which are their own), so the navbar and hearts can show the right state. */
export async function GET() {
  const g = await currentGuest();
  // A finished stay waiting for a review, with its photo so the prompt can show it.
  const r = g?.review;
  const cover = r ? (await getProperties()).find((p) => p.slug === r.slug)?.cover ?? null : null;
  return NextResponse.json(
    { guest: g ? { name: g.name, email: g.email, saved: g.saved, review: r ? { ...r, cover } : null } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
