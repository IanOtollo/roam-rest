import { jwtVerify, SignJWT } from "jose";

/**
 * The admin session is a signed token in an httpOnly, SameSite=Strict cookie. It contains no
 * email or personal data. To sign everyone out at once, change ADMIN_SESSION_SECRET.
 *
 * This file is safe to import from middleware (it uses only `jose`).
 */

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rr_admin" : "rr_admin";
export const SESSION_HOURS = 8;

const key = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
};

export async function signSession() {
  const k = key();
  if (!k) throw new Error("ADMIN_SESSION_SECRET is not set (needs 32+ characters).");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(k);
}

export async function isValidSessionToken(token: string | undefined) {
  const k = key();
  if (!token || !k) return false;
  try {
    const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
