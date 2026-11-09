"use client";

import { hasRate } from "@/lib/property";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ease, formatKES } from "@/lib/utils";
import type { Match } from "@/lib/search";

/** Compact Airbnb-style listing card. Photo, place, a one-line summary and the price. */
export function PropertyCard({
  match,
  index,
  guests,
  start,
  end,
}: {
  match: Match;
  index: number;
  guests: number;
  start: string | null;
  end: string | null;
}) {
  const { property, unit, nights, total } = match;

  // Golden-star average across this stay's published reviews.
  const rated = property.reviews.filter((r) => typeof r.rating === "number");
  const average = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : 0;

  // Carry the visitor's search into the stay page so the booking panel opens pre-filled.
  const q = new URLSearchParams({ unit: unit.id });
  if (start && end) {
    q.set("in", start);
    q.set("out", end);
  }
  if (guests > 0) q.set("guests", String(guests));

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease, delay: Math.min(index, 4) * 0.06 }}
    >
      <Link href={`/stays/${property.slug}?${q.toString()}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          {rated.length > 0 && (
            <span
              className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 shadow-sm backdrop-blur-sm"
              aria-label={`${average.toFixed(1)} out of 5 from ${rated.length} ${rated.length === 1 ? "review" : "reviews"}`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
              {average.toFixed(1)}
              <span className="font-normal text-muted-foreground">({rated.length})</span>
            </span>
          )}
          <Image
            src={property.cover}
            alt={property.title}
            width={960}
            height={1280}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 48vw"
            className="aspect-[5/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="mt-3 space-y-0.5">
          <h3 className="text-sm font-medium leading-snug sm:text-base">{property.title}</h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {property.area}, {property.city}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Sleeps up to {unit.maxGuests} · {unit.bedrooms} bedrooms · {unit.label.replace(/^The /, "")}
          </p>
          {hasRate(unit) && (
          <p className="pt-1 text-sm">
            {total !== null ? (
              <>
                <span className="font-medium">{formatKES(total)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  for {nights} nights
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">From </span>
                <span className="font-medium">{formatKES(unit.nightlyRate)}</span>
                <span className="text-muted-foreground"> / night</span>
              </>
            )}
          </p>
          )}
        </div>
      </Link>
    </motion.li>
  );
}
