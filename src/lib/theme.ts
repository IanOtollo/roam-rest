"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "theme";
const EVENT = "themechange";

export const isDark = () => document.documentElement.classList.contains("dark");

/**
 * Switches theme and remembers the choice. When the browser supports View
 * Transitions the new theme is revealed as a circle growing from `origin`
 * (in viewport pixels), otherwise it switches instantly.
 */
export function setTheme(dark: boolean, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* private mode: the choice just won't persist */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } })
    .startViewTransition;

  if (!vt || reduce || !origin) return apply();

  const transition = vt.call(document, apply);
  transition.ready
    .then(() => {
      const { x, y } = origin;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

/** Current theme, kept in sync across every component that uses it. */
export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(isDark());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback((origin?: { x: number; y: number }) => setTheme(!isDark(), origin), []);
  return { dark, toggle };
}
