"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn, ease } from "@/lib/utils";
import { amenityKey } from "@/lib/amenities";
import { getAmenityIcon } from "@/lib/amenityIcons";
import { useBooking } from "@/components/booking/BookingContext";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

const INITIAL = 8;

export function Amenities() {
  const { property } = useBooking();
  const [all, setAll] = useState(false);
  const list = property.amenities;
  if (list.length === 0) return null;

  const shown = all ? list : list.slice(0, INITIAL);

  return (
    <Reveal>
      <SectionHeading eyebrow="Everything you need" title="What's included" />
      <motion.ul
        key={all ? "all" : "some"}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        {shown.map((a) => {
          const Icon = getAmenityIcon(a.icon);
          return (
            <motion.li
              key={amenityKey(a)}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease }}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border/50 bg-card p-4 sm:flex-row sm:gap-4 sm:p-6"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="font-medium">{a.label}</p>
                <p className="text-sm text-muted-foreground">{a.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      {list.length > INITIAL && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm transition-colors hover:bg-muted active:scale-[0.98]"
        >
          {all ? "Show fewer" : `Show all ${list.length} amenities`}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", all && "rotate-180")} />
        </button>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {property.minNights}-night minimum stay · Sleeps up to {property.maxGuests}.
      </p>
    </Reveal>
  );
}
