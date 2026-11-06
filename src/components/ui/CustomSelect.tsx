"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn, ease } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Small second line under the label. */
  hint?: string;
  /** Optional thumbnail (used by the photo pickers). */
  image?: string;
  /** Optional small icon shown before the label (used by the amenity icon picker). */
  icon?: React.ReactNode;
};

/**
 * Custom dropdown in the site's style, used instead of the browser's native <select>.
 * Keyboard: Enter / Space / arrows open it, arrows move, Enter chooses, Esc closes,
 * Home / End jump to the first / last option. It opens upwards when there is no room below.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Choose…",
  disabled = false,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const current = options.find((o) => o.value === value);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Decide direction, then focus the selected option when the menu opens.
  useEffect(() => {
    if (!open) return;
    const r = trigger.current?.getBoundingClientRect();
    if (r) {
      const wanted = Math.min(288, options.length * 56 + 16);
      setUp(window.innerHeight - r.bottom < wanted && r.top > window.innerHeight - r.bottom);
    }
    const i = Math.max(0, options.findIndex((o) => o.value === value));
    requestAnimationFrame(() => items.current[i]?.focus());
  }, [open, options, value]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };
  const focusItem = (i: number) => items.current[(i + options.length) % options.length]?.focus();

  function onListKey(e: React.KeyboardEvent) {
    const i = items.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") (e.preventDefault(), focusItem(i + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), focusItem(i - 1));
    else if (e.key === "Home") (e.preventDefault(), focusItem(0));
    else if (e.key === "End") (e.preventDefault(), focusItem(options.length - 1));
    else if (e.key === "Escape") (e.preventDefault(), close());
    else if (e.key === "Tab") close(false);
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 text-left text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          open ? "border-primary" : "border-border",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          {current?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.image} alt="" className="h-10 w-8 shrink-0 rounded-md bg-muted object-cover" />
          )}
          {current?.icon && <span className="shrink-0 text-accent">{current.icon}</span>}
          <span className={cn("truncate", !current && "text-muted-foreground/60")}>{current?.label ?? placeholder}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className={cn(
              "absolute left-0 z-40 max-h-72 w-full min-w-[12rem] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-xl",
              up ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
            )}
          >
            {options.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">Nothing to choose yet.</li>}
            {options.map((o, i) => {
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
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                      selected && "bg-muted/60",
                    )}
                  >
                    {o.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.image} alt="" className="h-10 w-8 shrink-0 rounded-md bg-muted object-cover" />
                    )}
                    {o.icon && <span className="shrink-0 text-accent">{o.icon}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{o.label}</span>
                      {o.hint && <span className="block truncate text-xs text-muted-foreground">{o.hint}</span>}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-accent" />}
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
