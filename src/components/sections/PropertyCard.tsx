"use client";

import { hasRate } from "@/lib/property";
import Image from "next/image";
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
        <div className="overflow-hidden rounded-2xl bg-muted">
          <Image
            src={property.cover}
            alt={property.title}
            width={960}
            height={1280}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="aspect-[5/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="mt-3 space-y-0.5">
          <h3 className="font-medium leading-snug">{property.title}</h3>
          <p className="text-sm text-muted-foreground">
            {property.area}, {property.city}
          </p>
          <p className="text-sm text-muted-foreground">
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
