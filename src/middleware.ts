import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/admin/session";

/**
 * Defence in depth for the admin area (each admin page and action also checks the session):
 *  - every /admin response tells search engines not to index it,
 *  - any /admin page other than the sign-in screen itself needs a valid session cookie.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isSignIn = pathname === "/admin" || pathname === "/admin/";

  if (!isSignIn) {
    const ok = await isValidSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      const res = NextResponse.redirect(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
