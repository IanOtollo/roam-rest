import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { api } from "../../../../../../convex/_generated/api";
import { adminMutation, convexReady } from "@/lib/admin/server";
import { GUEST_COOKIE, guestAuthReady, guestCookieOptions, signGuestSession } from "@/lib/guest/session";
import { safeNext } from "@/lib/guest/server";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATE_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rr_gstate" : "rr_gstate";

const fail = () => {
  const res = NextResponse.redirect(`${siteUrl()}/account/sign-in?error=1`);
  res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
};

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Step 2: Google sends the guest back here with a one-time code. Check it, then sign them in. */
export async function GET(req: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret || !guestAuthReady() || !convexReady()) return fail();

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return fail();

    const cookie = req.headers.get("cookie")?.split(/;\s*/).find((c) => c.startsWith(`${STATE_COOKIE}=`));
    if (!cookie) return fail();
    const saved = JSON.parse(decodeURIComponent(cookie.slice(STATE_COOKIE.length + 1))) as { state?: string; next?: string };
    if (!saved.state || !same(saved.state, state)) return fail();

    // The code is exchanged server to server over TLS, so the token that comes back is trusted.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${siteUrl()}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail();
    const { id_token } = (await tokenRes.json()) as { id_token?: string };
    if (!id_token) return fail();

    const claims = JSON.parse(Buffer.from(id_token.split(".")[1], "base64url").toString("utf8")) as {
      iss?: string;
      aud?: string;
      exp?: number;
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
    if (!issuerOk || claims.aud !== clientId || !claims.exp || claims.exp * 1000 < Date.now()) return fail();
    if (!claims.sub || !claims.email || claims.email_verified !== true) return fail();

    const id = await adminMutation(api.guests.signInWithGoogle, {
      googleId: claims.sub,
      email: claims.email,
      name: claims.name ?? "",
    });
    if (!id) return fail();

    const res = NextResponse.redirect(`${siteUrl()}${safeNext(saved.next)}`);
    res.cookies.set(GUEST_COOKIE, await signGuestSession(id), guestCookieOptions);
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    console.error("[google sign-in] failed:", e);
    return fail();
  }
}
