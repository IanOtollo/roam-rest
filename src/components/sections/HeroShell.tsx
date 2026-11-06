"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Full-viewport hero that starts leaving the moment the page scrolls:
 * the copy lifts away and fades while the artwork recedes, shrinks and
 * dissolves, like stepping back from a window.
 */
export function HeroShell({ copy, art }: { copy: React.ReactNode; art: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const artY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const artOpacity = useTransform(scrollYProgress, [0.1, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="min-w-0 lg:pt-12">
          {copy}
        </motion.div>
        <motion.div style={{ y: artY, scale: artScale, opacity: artOpacity }} className="min-w-0">
          {art}
        </motion.div>
      </div>
    </section>
  );
}
