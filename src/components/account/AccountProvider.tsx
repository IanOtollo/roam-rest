"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ReviewPrompt } from "./ReviewPrompt";

/** A confirmed stay that has ended and is waiting for the guest's review. */
export interface ReviewStay {
  inquiryId: string;
  slug: string;
  title: string;
  unitLabel: string | null;
  start: string;
  end: string;
  cover: string | null;
}

interface AccountState {
  /** Null until we know; `signedIn` says which. */
  name: string | null;
  email: string | null;
  savedCount: number;
  review: ReviewStay | null;
  signedIn: boolean;
  isSaved: (slug: string) => boolean;
  /** Hearts or un-hearts a stay. Sends signed-out visitors to the sign-in page. */
  toggleSaved: (slug: string) => Promise<void>;
}

const Ctx = createContext<AccountState>({
  name: null,
  email: null,
  savedCount: 0,
  review: null,
  signedIn: false,
  isSaved: () => false,
  toggleSaved: async () => {},
});

export const useAccount = () => useContext(Ctx);

/**
 * Knows who is signed in. It asks the server once after the page loads, so every page stays cached
 * and fast, and visitors who never sign in are not affected at all.
 */
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewStay | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const router = useRouter();
  const path = usePathname();
  // A tap that arrives before the server has said who is signed in waits for the answer.
  const known = useRef<Promise<boolean>>(Promise.resolve(false));

  useEffect(() => {
    let live = true;
    let done: (v: boolean) => void = () => {};
    known.current = new Promise<boolean>((r) => (done = r));
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { guest: { name: string; email: string; saved: string[]; review: ReviewStay | null } | null } | null) => {
        if (!live || !d?.guest) return done(false);
        setSignedIn(true);
        setName(d.guest.name);
        setEmail(d.guest.email);
        setReview(d.guest.review);
        setSaved(new Set(d.guest.saved));
        done(true);
      })
      .catch(() => {
        /* signed-out behaviour is the safe default */
        done(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const toggleSaved = useCallback(
    async (slug: string) => {
      if (!signedIn && !(await known.current)) {
        router.push(`/account/sign-in?next=${encodeURIComponent(path || "/")}`);
        return;
      }
      // Optimistic: flip the heart now, undo if the server says no.
      const flip = (on: boolean) =>
        setSaved((s) => {
          const n = new Set(s);
          if (on) n.add(slug);
          else n.delete(slug);
          return n;
        });
      const was = saved.has(slug);
      flip(!was);
      try {
        const res = await fetch("/api/account/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (res.status === 401) {
          flip(was);
          setSignedIn(false);
          router.push(`/account/sign-in?next=${encodeURIComponent(path || "/")}`);
          return;
        }
        if (!res.ok) flip(was);
        else flip((await res.json()).saved === true);
      } catch {
        flip(was);
      }
    },
    [signedIn, saved, router, path],
  );

  const value = useMemo<AccountState>(
    () => ({ name, email, savedCount: saved.size, review, signedIn, isSaved: (slug) => saved.has(slug), toggleSaved }),
    [name, email, review, signedIn, saved, toggleSaved],
  );
  return (
    <Ctx.Provider value={value}>
      {children}
      <ReviewPrompt />
    </Ctx.Provider>
  );
}
