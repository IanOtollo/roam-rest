import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { hashKey } from "./crypto";
import { isValidSessionToken, SESSION_COOKIE } from "./session";

/* ----------------------------------------------------------------- config */

export function adminConfig() {
  const emailHash = process.env.ADMIN_EMAIL_HASH;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const pepper = process.env.ADMIN_EMAIL_PEPPER;
  if (!emailHash || !passwordHash || !pepper || !process.env.ADMIN_SESSION_SECRET) return null;
  return { emailHash, passwordHash, pepper };
}

export const convexReady = () => !!process.env.NEXT_PUBLIC_CONVEX_URL && !!process.env.ADMIN_API_SECRET;

/* ---------------------------------------------------------------- session */

export async function hasSession() {
  return isValidSessionToken(cookies().get(SESSION_COOKIE)?.value);
}

/** For admin pages: anyone without a valid session goes back to the sign-in screen. */
export async function requireSession() {
  if (!(await hasSession())) redirect("/admin");
}

/** For server actions: stop dead if the caller isn't signed in. */
export async function assertSession() {
  if (!(await hasSession())) throw new Error("Please sign in again.");
}

/* --------------------------------------------------------- convex bridge */

const secret = () => {
  const s = process.env.ADMIN_API_SECRET;
  if (!s) throw new Error("ADMIN_API_SECRET is not set.");
  return s;
};

/** Reads admin-only data. Call only after the session has been checked. */
export function adminQuery<Q extends FunctionReference<"query">>(
  fn: Q,
  args: Omit<FunctionArgs<Q>, "secret">,
): Promise<FunctionReturnType<Q>> {
  return fetchQuery(fn, { ...args, secret: secret() } as FunctionArgs<Q>) as Promise<FunctionReturnType<Q>>;
}

/** Changes admin-only data. Call only after the session has been checked. */
export function adminMutation<M extends FunctionReference<"mutation">>(
  fn: M,
  args: Omit<FunctionArgs<M>, "secret">,
): Promise<FunctionReturnType<M>> {
  return fetchMutation(fn, { ...args, secret: secret() } as FunctionArgs<M>) as Promise<FunctionReturnType<M>>;
}

/** Turns any error into a short message that is safe to show the admin. */
export function explain(e: unknown): string {
  if (e instanceof ConvexError) return typeof e.data === "string" ? e.data : "That didn't work. Please check the details.";
  if (e instanceof Error && /sign in again/i.test(e.message)) return e.message;
  return "Something went wrong. Please try again.";
}

/** After any admin change, refresh every public page so visitors see it straight away. */
export function refreshSite() {
  revalidateTag("properties"); // the cached property data
  revalidatePath("/", "layout"); // every page built from it
}

/* ------------------------------------------------------------ rate limiting */

const memory = new Map<string, { failures: number; lockedUntil: number; at: number }>();
const MAX_FAILURES = 5;
const WINDOW = 15 * 60_000;

export async function clientKey(pepper: string) {
  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return hashKey(ip, pepper);
}

/** Uses Convex when available (shared across servers), otherwise memory (single process). */
export const limiter = {
  async locked(key: string) {
    if (convexReady()) {
      try {
        const { api } = await import("../../../convex/_generated/api");
        return (await adminQuery(api.attempts.status, { key })).locked;
      } catch {
        /* fall through to memory so a Convex hiccup never disables the lock */
      }
    }
    const row = memory.get(key);
    return !!row && row.lockedUntil > Date.now();
  },
  async fail(key: string) {
    const now = Date.now();
    const row = memory.get(key);
    const failures = row && now - row.at < WINDOW ? row.failures + 1 : 1;
    memory.set(key, { failures, lockedUntil: failures >= MAX_FAILURES ? now + WINDOW : 0, at: now });
    if (convexReady()) {
      try {
        const { api } = await import("../../../convex/_generated/api");
        await adminMutation(api.attempts.fail, { key });
      } catch {
        /* memory copy above still protects this server */
      }
    }
  },
  async clear(key: string) {
    memory.delete(key);
    if (convexReady()) {
      try {
        const { api } = await import("../../../convex/_generated/api");
        await adminMutation(api.attempts.clear, { key });
      } catch {
        /* ignore */
      }
    }
  },
};
