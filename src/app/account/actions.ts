"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { adminMutation, adminQuery, clientKey, convexReady, limiter } from "@/lib/admin/server";
import { DUMMY_PASSWORD_HASH, hashEmail, hashPassword, randomToken, verifyPassword } from "@/lib/admin/crypto";
import { GUEST_COOKIE, guestAuthReady, guestCookieOptions, signGuestSession } from "@/lib/guest/session";
import { currentGuestId, safeNext } from "@/lib/guest/server";

export type AuthState = { error?: string };

const BUSY = "Too many attempts. Please wait a few minutes and try again.";
const DOWN = "Accounts aren't available right now. You can still book as a guest.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").slice(0, max);

async function startSession(guestId: string) {
  cookies().set(GUEST_COOKIE, await signGuestSession(guestId), guestCookieOptions);
}

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (text(form, "website", 50) !== "") return { error: BUSY }; // honeypot
  const pepper = process.env.ADMIN_EMAIL_PEPPER;
  if (!guestAuthReady() || !convexReady() || !pepper) return { error: DOWN };

  const email = text(form, "email", 254).trim().toLowerCase();
  const password = text(form, "password", 200);
  const next = safeNext(form.get("next"));

  const ipKey = `guest:${await clientKey(pepper)}`;
  const mailKey = `guest-mail:${hashEmail(email, pepper)}`;
  if ((await limiter.locked(ipKey)) || (await limiter.locked(mailKey))) return { error: BUSY };

  let found: { id: string; passwordHash: string | null } | null = null;
  try {
    found = EMAIL.test(email) ? await adminQuery(api.guests.byEmail, { email }) : null;
  } catch {
    return { error: DOWN };
  }
  // Always do the full password work, so a wrong email takes as long as a wrong password.
  const ok = verifyPassword(password, found?.passwordHash ?? DUMMY_PASSWORD_HASH) && !!found?.passwordHash;
  if (!ok || !found) {
    await limiter.fail(ipKey);
    await limiter.fail(mailKey);
    return { error: "That email and password don't match. If you signed up with Google, use the Google button." };
  }
  await limiter.clear(ipKey);
  await limiter.clear(mailKey);
  await startSession(found.id);
  redirect(next);
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (text(form, "website", 50) !== "") return { error: BUSY };
  const pepper = process.env.ADMIN_EMAIL_PEPPER;
  if (!guestAuthReady() || !convexReady() || !pepper) return { error: DOWN };

  const name = text(form, "name", 60).trim();
  const email = text(form, "email", 254).trim().toLowerCase();
  const password = text(form, "password", 200);
  const next = safeNext(form.get("next"));

  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Please choose a password of at least 8 characters." };
  if (password.length > 128) return { error: "That password is too long. Please keep it under 128 characters." };

  // Each sign-up attempt counts, so one visitor can't create accounts in bulk.
  const ipKey = `guest-signup:${await clientKey(pepper)}`;
  if (await limiter.locked(ipKey)) return { error: BUSY };
  await limiter.fail(ipKey);

  try {
    const r = await adminMutation(api.guests.signUp, { email, name, passwordHash: hashPassword(password) });
    if (!r.ok) {
      return {
        error:
          r.reason === "exists"
            ? "There's already an account with that email. Try signing in instead."
            : "Please enter a valid email address.",
      };
    }
    await startSession(r.id);
  } catch (e) {
    if (e instanceof ConvexError && typeof e.data === "string") return { error: e.data };
    return { error: DOWN };
  }
  redirect(next);
}

export async function signOutAction() {
  cookies().set(GUEST_COOKIE, "", { ...guestCookieOptions, maxAge: 0 });
  redirect("/");
}

export async function deleteAccountAction() {
  const id = await currentGuestId();
  if (id && convexReady()) {
    try {
      await adminMutation(api.guests.deleteAccount, { id });
    } catch {
      /* the cookie is cleared below either way */
    }
  }
  cookies().set(GUEST_COOKIE, "", { ...guestCookieOptions, maxAge: 0 });
  redirect("/");
}

/** "Leave a review" on the prompt: make a one-time review link for the finished stay and open it. */
export async function startReviewAction(inquiryId: string) {
  const id = await currentGuestId();
  if (!id || !convexReady() || typeof inquiryId !== "string") redirect("/account");
  const token = randomToken(32);
  let ok = false;
  try {
    ok = await adminMutation(api.guests.startReview, { id, inquiryId: inquiryId as Id<"inquiries">, token });
  } catch {
    ok = false;
  }
  redirect(ok ? `/review/${token}` : "/account");
}
