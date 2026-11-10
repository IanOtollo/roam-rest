import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { adminMutation, convexReady } from "@/lib/admin/server";
import { currentGuestId } from "@/lib/guest/server";

export const dynamic = "force-dynamic";

/** Heart or un-heart a stay for the signed-in guest. */
export async function POST(req: Request) {
  // Same-site requests only.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const id = await currentGuestId();
  if (!id || !convexReady()) return NextResponse.json({ error: "signin" }, { status: 401 });

  let slug = "";
  try {
    const b = (await req.json()) as { slug?: unknown };
    slug = typeof b.slug === "string" ? b.slug.slice(0, 80) : "";
  } catch {
    /* handled below */
  }
  if (!slug) return NextResponse.json({ error: "bad" }, { status: 400 });

  try {
    const saved = await adminMutation(api.guests.toggleSaved, { id, slug });
    if (saved === null) return NextResponse.json({ error: "signin" }, { status: 401 });
    return NextResponse.json({ saved });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
