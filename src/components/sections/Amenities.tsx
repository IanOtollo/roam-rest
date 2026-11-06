"use client";

import { motion } from "framer-motion";
import { BedDouble, Car, Clock, CookingPot, Waves, Wifi, type LucideIcon } from "lucide-react";
import { ease } from "@/lib/utils";
import type { Amenity } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

const icons: Record<Amenity["icon"], LucideIcon> = {
  wifi: Wifi,
  kitchen: CookingPot,
  pool: Waves,
  parking: Car,
  ensuite: BedDouble,
  clock: Clock,
};

export function Amenities() {
  const { property } = useBooking();
  return (
    <Reveal>
      <SectionHeading eyebrow="Everything you need" title="What's included" />
      <motion.ul
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {property.amenities.map((a) => {
          const Icon = icons[a.icon];
          return (
            <motion.li
              key={a.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease }}
              className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-6"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="font-medium">{a.label}</p>
                <p className="text-sm text-muted-foreground">{a.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
      <p className="mt-6 text-sm text-muted-foreground">
        {property.minNights}-night minimum stay · Sleeps up to {property.maxGuests}.
      </p>
    </Reveal>
  );
}
