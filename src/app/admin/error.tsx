"use client";

import { btnPrimary, btnSecondary } from "@/components/admin/ui";

/** Shown inside the admin if loading data fails (for example a brief network problem). */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-3xl tracking-tight">That didn&apos;t load</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t reach the database just now. Nothing was lost. Please try again in a moment.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>
          Try again
        </button>
        <a href="/admin" className={btnSecondary}>
          Back to overview
        </a>
      </div>
    </div>
  );
}
