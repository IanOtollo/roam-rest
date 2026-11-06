"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { ease } from "@/lib/utils";

/**
 * Small circular back-to-top button. The ring fills as you scroll down the
 * page, and it appears once you've left the top. Positioned by <FloatingActions>.
 */
export function ScrollToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 400));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.3, ease }}
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-background/90 shadow-lg backdrop-blur-md"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" strokeWidth="2.5" className="stroke-border" />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="stroke-accent"
              style={{ pathLength: fill }}
            />
          </svg>
          <ArrowUp className="arrow-up relative h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
