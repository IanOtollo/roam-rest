"use client";

import { motion } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { ease } from "@/lib/utils";
import type { Property } from "@/lib/property";
import { HeroShell } from "./HeroShell";
import { PropertyCarousel } from "./PropertyCarousel";

/** Brand hero for the home page. The artwork is a carousel through every property. */
export function HomeHero({ properties, cities }: { properties: Property[]; cities: string[] }) {
  return (
    <HeroShell
      copy={
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <MapPin className="h-4 w-4" /> Curated stays · {cities.join(", ")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mt-3 text-6xl tracking-tighter sm:text-7xl lg:text-8xl"
          >
            Roam
            <br />
            <span className="italic text-accent">&amp;</span> Rest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
            className="mt-5 max-w-md text-lg text-muted-foreground"
          >
            Characterful homes with a story in every room. Find a place to roam from, and rest in.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <a
              href="#stays"
              className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Browse stays <ArrowDown className="arrow-down h-4 w-4" />
            </a>
          </motion.div>
        </div>
      }
      art={<PropertyCarousel properties={properties} />}
    />
  );
}
