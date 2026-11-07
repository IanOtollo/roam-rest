"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/utils";

const INTERVAL_MS = 2800;

/**
 * Cycles through the places we have stays in, each one swiping in from the right as the
 * previous one slides out to the left. Static when there is one place or motion is reduced.
 */
export function LocationSwipe({ cities }: { cities: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const moving = cities.length > 1 && !reduce;

  useEffect(() => {
    if (!moving) return;
    const id = setInterval(() => setI((n) => (n + 1) % cities.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [moving, cities.length]);

  if (!moving) return <span>{cities.join(", ")}</span>;

  return (
    <motion.span layout transition={{ duration: 0.5, ease }} className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={cities[i]}
          initial={{ x: "110%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-110%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className="whitespace-nowrap text-foreground"
        >
          {cities[i]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
