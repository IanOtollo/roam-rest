"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * A dog tag hanging from the top edge of a card: the rating on top, one gold star below.
 * It swings gently on its chain.
 */
export function RatingTag({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const shown = Number(value.toFixed(1));

  return (
    <motion.span
      role="img"
      aria-label={`Rated ${shown} out of 5`}
      className="pointer-events-none absolute right-3 top-0 z-10 flex origin-top flex-col items-center sm:right-4"
      initial={{ rotate: 0 }}
      animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* the chain */}
      <span className="h-3 w-px border-l border-dashed border-foreground/50 sm:h-4" />
      {/* the tag */}
      <span className="relative flex h-11 w-8 flex-col items-center justify-end rounded-lg border border-foreground/20 bg-background/95 pb-1.5 shadow-md backdrop-blur-sm sm:h-14 sm:w-10 sm:pb-2">
        <span className="absolute top-1.5 h-1.5 w-1.5 rounded-full border border-foreground/30 bg-muted" />
        <span className="font-serif text-sm font-semibold leading-none sm:text-base">{shown}</span>
        <Star className="mt-0.5 h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" strokeWidth={1.5} />
      </span>
    </motion.span>
  );
}
