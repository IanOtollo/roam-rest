import "server-only";
import { cookies } from "next/headers";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { adminQuery, convexReady } from "@/lib/admin/server";
import { GUEST_COOKIE, readGuestSession } from "./session";

/** The signed-in guest's id, or null. Never throws. */
export async function currentGuestId(): Promise<Id<"guests"> | null> {
  const id = await readGuestSession(cookies().get(GUEST_COOKIE)?.value);
  return id ? (id as Id<"guests">) : null;
}

/** The signed-in guest with their saved stays and any stay waiting for a review, or null (signed out, or the account was deleted). */
export async function currentGuest() {
  if (!convexReady()) return null;
  const id = await currentGuestId();
  if (!id) return null;
  try {
    return await adminQuery(api.guests.me, { id });
  } catch {
    return null;
  }
}

/** Only same-site relative paths, so "?next=" can never send a guest to another website. */
export function safeNext(v: unknown, fallback = "/account") {
  return typeof v === "string" && /^\/(?!\/)[\w\-./?=&%#]*$/.test(v) ? v : fallback;
}
