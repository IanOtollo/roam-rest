"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Light / dark switch drawn from the logo: a sun resting on the sea. Switching to dark
 * lets the sun set and the moon rise while stars appear and the sea deepens. The new theme
 * sweeps across the page from the toggle (see lib/theme.ts).
 */
export function SunsetToggle({ className }: { className?: string }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={cn(
        "relative h-8 w-14 shrink-0 overflow-hidden rounded-full border border-border outline-none transition-transform focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.97]",
        className,
      )}
    >
      {/* Sky: warm by day, deep by night. */}
      <span className="absolute inset-0 bg-gradient-to-b from-accent/10 to-accent/35 transition-opacity duration-700 dark:opacity-0" />
      <span className="absolute inset-0 bg-night opacity-0 transition-opacity duration-700 dark:opacity-100" />

      {/* Stars appear on the left as the sun leaves. */}
      <span aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-700 dark:opacity-100">
        <span className="absolute left-[10px] top-[7px] h-[3px] w-[3px] rounded-full bg-foreground/80" />
        <span className="absolute left-[20px] top-[13px] h-0.5 w-0.5 rounded-full bg-foreground/60" />
        <span className="absolute left-[15px] top-[4px] h-0.5 w-0.5 rounded-full bg-foreground/50" />
      </span>

      {/* Sun / moon. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ x: dark ? 24 : 0, y: dark ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="absolute left-[4px] top-[4px] h-[22px] w-[22px]"
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-accent shadow-[0_0_14px_hsl(var(--accent)/0.75)] transition-all duration-500",
            dark ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute inset-0 overflow-hidden rounded-full bg-foreground transition-all duration-500",
            dark ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-50 opacity-0",
          )}
        >
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-night" />
        </span>
      </motion.span>

      {/* Waves in front, so the sun sits on the horizon. */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[34%] overflow-hidden">
        <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="animate-wave h-full w-[200%] fill-sea transition-colors duration-700">
          <path d="M0 5 Q12.5 0 25 5 T50 5 T75 5 T100 5 T125 5 T150 5 T175 5 T200 5 V10 H0 Z" />
        </svg>
      </span>
    </button>
  );
}
