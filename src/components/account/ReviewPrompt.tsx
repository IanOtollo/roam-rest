"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import { ease } from "@/lib/utils";
import { startReviewAction } from "@/app/account/actions";
import { useAccount } from "./AccountProvider";

const KEY = "rr_review_later";
// Pages where a pop-up would be in the way.
const QUIET = ["/review", "/admin", "/inquiry", "/account/sign-in", "/account/sign-up"];

const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

/**
 * When a signed-in guest has finished a confirmed stay and hasn't reviewed it, a large card asks how it
 * went and takes them straight to the review form. "Maybe later" hides it for the rest of the visit; it
 * comes back next time until they review.
 */
export function ReviewPrompt() {
  const { review } = useAccount();
  const path = usePathname() ?? "/";
  const [later, setLater] = useState(true); // true until we've read the saved choice, so it never flashes
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setLater(!!review && sessionStorage.getItem(KEY) === review.inquiryId);
    } catch {
      setLater(false);
    }
  }, [review]);

  const open = !!review && !later && !QUIET.some((q) => path.startsWith(q));

  useEffect(() => {
    if (!open) return;
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    try {
      if (review) sessionStorage.setItem(KEY, review.inquiryId);
    } catch {
      /* it just comes back on the next page, which is fine */
    }
    setLater(true);
  }

  return (
    <AnimatePresence>
      {open && review && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" aria-label="Close" onClick={dismiss} className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-prompt-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            {review.cover && (
              <div className="relative h-44 w-full bg-muted sm:h-52">
                <Image src={review.cover} alt="" fill sizes="448px" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Not now"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Your stay</p>
              <h2 id="review-prompt-title" className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">
                How was {review.title}?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {review.unitLabel ? `${review.unitLabel} · ` : ""}
                {day(review.start)} to {day(review.end)}. Your words help the next guest choose, and they mean a lot to us.
              </p>

              <div className="mt-5 flex items-center gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-7 w-7 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                ))}
              </div>

              <form action={startReviewAction.bind(null, review.inquiryId)} className="mt-6 space-y-2">
                <button
                  ref={primary}
                  type="submit"
                  className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                  Leave a review
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="w-full rounded-xl px-5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Maybe later
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
