import { NextResponse } from "next/server";
import { randomToken } from "@/lib/admin/crypto";
import { guestAuthReady } from "@/lib/guest/session";
import { safeNext } from "@/lib/guest/server";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rr_gstate" : "rr_gstate";

/** Step 1 of "Continue with Google": remember a one-time state value, then send the guest to Google. */
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !guestAuthReady()) {
    return NextResponse.redirect(`${siteUrl()}/account/sign-in?error=1`);
  }
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const state = randomToken(24);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${siteUrl()}/api/auth/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
