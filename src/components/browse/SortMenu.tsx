"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn, ease } from "@/lib/utils";
import type { SortKey } from "@/lib/search";

const OPTIONS: { value: SortKey; label: string; hint: string }[] = [
  { value: "recommended", label: "Recommended", hint: "Our pick of the stays" },
  { value: "price-asc", label: "Price: low to high", hint: "Cheapest per night first" },
  { value: "price-desc", label: "Price: high to low", hint: "Most spacious and premium first" },
];

/**
 * Custom sort dropdown in the site's style (replaces the browser's native select).
 * Keyboard: Enter / Space / ArrowDown opens, arrows move, Enter chooses, Esc closes,
 * Home / End jump to the first / last option.
 */
export function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Move focus to the selected option when the menu opens.
  useEffect(() => {
    if (!open) return;
    const i = OPTIONS.findIndex((o) => o.value === value);
    requestAnimationFrame(() => items.current[i]?.focus());
  }, [open, value]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  const focusItem = (i: number) => items.current[(i + OPTIONS.length) % OPTIONS.length]?.focus();

  function onListKey(e: React.KeyboardEvent) {
    const i = items.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") (e.preventDefault(), focusItem(i + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), focusItem(i - 1));
    else if (e.key === "Home") (e.preventDefault(), focusItem(0));
    else if (e.key === "End") (e.preventDefault(), focusItem(OPTIONS.length - 1));
    else if (e.key === "Escape") (e.preventDefault(), close());
    else if (e.key === "Tab") close(false);
  }

  return (
    <div ref={root} className="relative flex items-center gap-2 text-sm">
      <span className="text-muted-foreground" id={`${listId}-label`}>
        Sort
      </span>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-card px-4 py-2 transition-colors hover:bg-muted active:scale-[0.98]",
          open ? "border-primary" : "border-border",
        )}
      >
        {current.label}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-label`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className="absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-card p-1.5 shadow-xl"
          >
            {OPTIONS.map((o, i) => {
              const selected = o.value === value;
              return (
                <li key={o.value} role="presentation">
                  <button
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(o.value);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                      selected && "bg-muted/60",
                    )}
                  >
                    <span>
                      <span className="block text-sm">{o.label}</span>
                      <span className="block text-xs text-muted-foreground">{o.hint}</span>
                    </span>
                    {selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
