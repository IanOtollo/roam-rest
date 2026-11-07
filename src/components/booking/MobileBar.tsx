"use client";

import { hasRate } from "@/lib/property";
import { formatKES } from "@/lib/utils";
import { useBooking } from "./BookingContext";

/** Keeps price and the reserve action in thumb reach on phones. */
export function MobileBar() {
  const { unitData: u, total, nights } = useBooking();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          {hasRate(u) ? (
            <>
              <p className="text-sm font-medium">
                {nights > 0 ? formatKES(total) : formatKES(u.nightlyRate)}
                <span className="font-normal text-muted-foreground">{nights > 0 ? ` · ${nights} nights` : " / night"}</span>
              </p>
              <p className="text-xs text-muted-foreground">{u.label}</p>
            </>
          ) : (
            <p className="text-sm font-medium">{u.label}</p>
          )}
        </div>
        <a
          href="#book"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground active:scale-[0.98]"
        >
          Reserve
        </a>
      </div>
    </div>
  );
}
