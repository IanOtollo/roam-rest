"use client";

import { BadgeCheck } from "lucide-react";
import { getUnit } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

/** Hidden entirely until at least one verified guest has reviewed the stay. */
export function Reviews() {
  const { property } = useBooking();
  if (property.reviews.length === 0) return null;

  return (
    <Reveal>
      <SectionHeading eyebrow="Guest reviews" title="Only from people who've stayed" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {property.reviews.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border/50 bg-card p-8">
            <p className="font-serif text-xl leading-snug tracking-tight">&ldquo;{r.quote}&rdquo;</p>
            <p className="mt-6 flex items-center gap-2 text-sm">
              <BadgeCheck className="h-4 w-4 text-accent" /> {r.author}
            </p>
            <p className="text-xs text-muted-foreground">
              Stayed {r.stayed} · {r.nights} nights · {getUnit(property, r.unit).label}
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
