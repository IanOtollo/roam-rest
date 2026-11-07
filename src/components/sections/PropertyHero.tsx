"use client";

import { motion } from "framer-motion";
import { ArrowDown, Bath, BedDouble, MapPin, Users, Waves } from "lucide-react";
import { ease } from "@/lib/utils";
import { useBooking } from "@/components/booking/BookingContext";
import { ShareButton } from "@/components/ui/ShareButton";
import { ArchStack, heroVariant } from "./ArchStack";
import { HeroShell } from "./HeroShell";

/** Hero of a single property page. Facts are derived from the property's data. */
export function PropertyHero() {
  const { property } = useBooking();
  const bedrooms = Math.max(...property.units.map((u) => u.bedrooms));
  const baths = Math.max(...property.units.map((u) => u.bathrooms));

  const facts = [
    { icon: Users, label: `Sleeps ${property.maxGuests}` },
    { icon: BedDouble, label: `${bedrooms} bedrooms` },
    { icon: Bath, label: `${baths} baths` },
    ...property.highlights.map((label) => ({ icon: Waves, label })),
  ];

  return (
    <>
      <HeroShell
        copy={
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <MapPin className="h-4 w-4" /> {property.area}, {property.city}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="mt-3 text-5xl tracking-tighter sm:text-6xl lg:text-7xl"
            >
              {property.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.25 }}
              className="mt-5 max-w-md text-lg text-muted-foreground"
            >
              {property.tagline}
            </motion.p>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {facts.map(({ icon: Icon, label }) => (
                <motion.li
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease }}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
                >
                  <Icon className="h-4 w-4 text-accent" /> {label}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <a
                href="#book"
                className="rounded-xl bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                Check availability
              </a>
              <ShareButton className="px-5 py-4" />
            </motion.div>
          </div>
        }
        art={<ArchStack images={property.heroImages} variant={heroVariant(property.slug)} />}
      />
      <motion.a
        href="#walkthrough"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="group mx-auto mb-8 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Step inside <ArrowDown className="arrow-down h-4 w-4" />
      </motion.a>
    </>
  );
}
