"use client";

import Link from "next/link";
import { brand } from "@/lib/property";

/** Shown if something unexpected fails while a page loads, instead of a raw error. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We couldn&apos;t load this page just now. Please try again, or message us on WhatsApp and we&apos;ll help you directly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-border px-6 py-3 text-sm transition-colors hover:bg-muted">
          {brand.name} home
        </Link>
      </div>
    </main>
  );
}
