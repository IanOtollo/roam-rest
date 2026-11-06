"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn, formatKES } from "@/lib/utils";
import { useBooking } from "@/components/booking/BookingContext";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

/** Lets guests pick how to stay (e.g. cottage, main house, whole estate). Hidden for single-unit properties. */
export function UnitPicker() {
  const { property, unit, setUnit } = useBooking();
  if (property.units.length < 2) return null;

  return (
    <Reveal>
      <SectionHeading eyebrow="Choose your stay" title="One property, a few ways to stay" />
      <ul className="grid gap-4 sm:grid-cols-3">
        {property.units.map((u) => {
          const active = unit === u.id;
          return (
            <li key={u.id}>
              <motion.button
                type="button"
                onClick={() => setUnit(u.id)}
                aria-pressed={active}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group w-full rounded-2xl border bg-card p-3 text-left transition-shadow hover:shadow-lg",
                  active ? "border-primary ring-1 ring-primary" : "border-border/50",
                )}
              >
                {/* bg-muted shows while the photo loads, so a card is never an empty box. */}
                <div className="relative overflow-hidden rounded-t-full rounded-b-xl bg-muted">
                  <Image
                    src={u.cover}
                    alt={u.label}
                    width={960}
                    height={1280}
                    loading="eager"
                    sizes="(min-width: 640px) 220px, 90vw"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {active && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary p-1.5 text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2 pt-4">
                  <p className="font-serif text-xl tracking-tight">{u.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {u.bedrooms} bedrooms · {u.bathrooms} baths · {u.maxGuests} guests
                  </p>
                  <p className="mt-3 text-sm">
                    {formatKES(u.nightlyRate)} <span className="text-muted-foreground">/ night</span>
                  </p>
                </div>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
