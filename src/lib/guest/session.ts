import "server-only";
import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

/**
 * Guest accounts are optional. The session is a signed token in an httpOnly cookie holding only the
 * guest's id. Its key is derived from ADMIN_SESSION_SECRET with a different label, so a guest token
 * can never pass as an admin one. Changing that secret signs everyone out.
 */

export const GUEST_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rr_guest" : "rr_guest";
export const GUEST_DAYS = 30;

const key = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return createHash("sha256").update(`guest-session:${secret}`).digest();
};

export const guestAuthReady = () => key() !== null && !!process.env.NEXT_PUBLIC_CONVEX_URL && !!process.env.ADMIN_API_SECRET;

export async function signGuestSession(guestId: string) {
  const k = key();
  if (!k) throw new Error("Accounts are not set up.");
  return new SignJWT({ role: "guest" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(guestId)
    .setIssuedAt()
    .setExpirationTime(`${GUEST_DAYS}d`)
    .sign(k);
}

export async function readGuestSession(token: string | undefined): Promise<string | null> {
  const k = key();
  if (!token || !k) return null;
  try {
    const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
    return payload.role === "guest" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export const guestCookieOptions = {
  httpOnly: true,
  // Lax, not Strict: the cookie must survive the redirect back from Google.
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: GUEST_DAYS * 86_400,
};
