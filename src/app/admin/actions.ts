"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { FunctionArgs } from "convex/server";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { properties as starter } from "@/lib/property";
import { DUMMY_PASSWORD_HASH, hashEmail, randomToken, safeEqualHex, verifyPassword } from "@/lib/admin/crypto";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/admin/session";
import {
  adminConfig,
  adminMutation,
  adminQuery,
  assertSession,
  clientKey,
  explain,
  limiter,
  refreshSite,
} from "@/lib/admin/server";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
const ok = <T>(data?: T): ActionResult<T> => ({ ok: true, data });
const fail = (e: unknown): ActionResult<never> => ({ ok: false, error: explain(e) });

/* ------------------------------------------------------------------ sign in */

export type LoginState = { error?: string };

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = adminConfig();
  if (!cfg) return { error: "Admin sign-in isn't set up yet." };

  const key = await clientKey(cfg.pepper);
  if (await limiter.locked(key)) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);

  // Both checks always run, so a wrong email costs the same time as a wrong password and
  // nobody can learn which email is the real one.
  const emailOk = safeEqualHex(hashEmail(email, cfg.pepper), cfg.emailHash);
  const passwordOk = verifyPassword(password, emailOk ? cfg.passwordHash : DUMMY_PASSWORD_HASH) && emailOk;

  await pause(250 + Math.random() * 250); // slows down guessing bots

  if (!emailOk || !passwordOk) {
    await limiter.fail(key);
    return { error: "Email or password is incorrect." };
  }

  await limiter.clear(key);
  cookies().set(SESSION_COOKIE, await signSession(), sessionCookieOptions);
  redirect("/admin");
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/"); // back to the main website
}

/* --------------------------------------------------------------- properties */

type PropertyInput = FunctionArgs<typeof api.properties.upsert>["property"];

export async function savePropertyAction(property: PropertyInput): Promise<ActionResult<{ slug: string }>> {
  try {
    await assertSession();
    const res = await adminMutation(api.properties.upsert, { property });
    refreshSite();
    return ok({ slug: res.slug });
  } catch (e) {
    return fail(e);
  }
}

export async function renamePropertyAction(from: string, to: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.properties.rename, { from, to });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function setPublishedAction(slug: string, published: boolean): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.properties.setPublished, { slug, published });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function moveAction(slug: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.properties.move, { slug, direction });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deletePropertyAction(slug: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.properties.remove, { slug });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/** One-click: copies the property that is built into the site into the database and publishes it. */
export async function importStarterAction(): Promise<ActionResult<{ count: number }>> {
  try {
    await assertSession();
    let count = 0;
    for (const p of starter) {
      const { bookings: _b, reviews: _r, ...fields } = p;
      void _b;
      void _r;
      await adminMutation(api.properties.upsert, { property: fields });
      await adminMutation(api.properties.setPublished, { slug: p.slug, published: true });
      count++;
    }
    refreshSite();
    return ok({ count });
  } catch (e) {
    return fail(e);
  }
}

/** A short-lived URL the browser uploads a photo to. */
export async function uploadUrlAction(): Promise<ActionResult<{ url: string }>> {
  try {
    await assertSession();
    return ok({ url: await adminMutation(api.properties.generateUploadUrl, {}) });
  } catch (e) {
    return fail(e);
  }
}

/* ----------------------------------------------------------------- bookings */

export async function createBookingAction(input: {
  propertySlug: string;
  unit: string;
  start: string;
  end: string;
  guestName?: string;
  guestContact?: string;
  note?: string;
}): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.bookings.create, input);
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function cancelBookingAction(id: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.bookings.cancel, { id: id as Id<"bookings"> });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteBookingAction(id: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.bookings.remove, { id: id as Id<"bookings"> });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ------------------------------------------------------------------ reviews */

export async function createInviteAction(input: {
  propertySlug: string;
  unit: string;
  nights: number;
  stayed: string;
  guestName?: string;
}): Promise<ActionResult<{ path: string }>> {
  try {
    await assertSession();
    const token = randomToken(24);
    await adminMutation(api.reviews.createInvite, { ...input, token });
    return ok({ path: `/review/${token}` });
  } catch (e) {
    return fail(e);
  }
}

export async function setReviewStatusAction(id: string, status: "pending" | "published" | "hidden"): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.reviews.setStatus, { id: id as Id<"reviews">, status });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.reviews.remove, { id: id as Id<"reviews"> });
    refreshSite();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function revokeInviteAction(id: string): Promise<ActionResult> {
  try {
    await assertSession();
    await adminMutation(api.reviews.revokeInvite, { id: id as Id<"reviewInvites"> });
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/** Lets the pages ask "is there anything in the database yet?" without exposing the secret. */
export async function propertyCountAction() {
  await assertSession();
  return (await adminQuery(api.properties.adminList, {})).length;
}
