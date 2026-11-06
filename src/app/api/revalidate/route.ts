import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const digest = (s: string) => createHash("sha256").update(s).digest();

/**
 * Tells the website to drop its cached property data and rebuild its pages straight away.
 * The admin does this automatically after every save. This endpoint lets anything else
 * (a script, a future automation) do the same. It needs the shared admin secret.
 */
export async function POST(req: Request) {
  const given = req.headers.get("x-revalidate-secret") ?? "";
  const expected = process.env.ADMIN_API_SECRET ?? "";
  if (expected.length < 32 || !timingSafeEqual(digest(given), digest(expected))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag("properties");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
