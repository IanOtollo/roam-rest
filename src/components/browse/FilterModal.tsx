"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { cn, ease, formatKES } from "@/lib/utils";
import type { AmenityOption, Filters, LocationGroup } from "@/lib/search";
import { PlacePicker } from "./PlacePicker";
import { RangeCalendar } from "./RangeCalendar";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-6 last:border-b-0">
      <h3 className="mb-4 font-serif text-xl tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

const pill = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-sm transition-colors active:scale-[0.98]",
    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
  );

/** "Filters" panel: price range, bedrooms and amenities. Changes apply live. */
export function FilterModal({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  resultCount,
  bounds,
  bedroomMax,
  amenities,
  places,
  total,
  guestMax,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  resultCount: number;
  bounds: { min: number; max: number };
  bedroomMax: number;
  amenities: AmenityOption[];
  places: LocationGroup[];
  total: number;
  guestMax: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const parse = (v: string) => (v === "" ? null : Math.max(0, Number(v)));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease }}
            className="relative flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="font-serif text-xl tracking-tight">Filters</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="rounded-full p-2 transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="overflow-y-auto px-6">
              <Group title="Place">
                <PlacePicker groups={places} total={total} value={filters.where} onChange={(where) => onChange({ where })} />
              </Group>

              <Group title="Dates">
                <RangeCalendar
                  months={1}
                  start={filters.start}
                  end={filters.end}
                  onChange={(start, end) => onChange({ start, end })}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  {filters.start && filters.end
                    ? "Showing only stays that are free for every night."
                    : "Pick check-in and check-out to see only stays that are free."}
                  {(filters.start || filters.end) && (
                    <button
                      type="button"
                      onClick={() => onChange({ start: null, end: null })}
                      className="ml-2 underline underline-offset-4"
                    >
                      Clear dates
                    </button>
                  )}
                </p>
              </Group>

              <Group title="Guests">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filters.guests > 0 ? `${filters.guests} guest${filters.guests > 1 ? "s" : ""}` : "Any number"}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Fewer guests"
                      disabled={filters.guests <= 0}
                      onClick={() => onChange({ guests: Math.max(0, filters.guests - 1) })}
                      className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="More guests"
                      disabled={filters.guests >= guestMax}
                      onClick={() => onChange({ guests: Math.min(guestMax, filters.guests + 1) })}
                      className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Group>

              {bounds.max > 0 && (
              <Group title="Price per night">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block rounded-xl border border-border p-3 focus-within:border-primary">
                    <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                      Minimum
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      value={filters.minPrice ?? ""}
                      placeholder={String(bounds.min)}
                      onChange={(e) => onChange({ minPrice: parse(e.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                  <label className="block rounded-xl border border-border p-3 focus-within:border-primary">
                    <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                      Maximum
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      value={filters.maxPrice ?? ""}
                      placeholder={String(bounds.max)}
                      onChange={(e) => onChange({ maxPrice: parse(e.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Nightly rates currently range from {formatKES(bounds.min)} to {formatKES(bounds.max)}.
                </p>
              </Group>
              )}

              <Group title="Bedrooms">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: bedroomMax + 1 }, (_, n) => n).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={filters.bedrooms === n}
                      onClick={() => onChange({ bedrooms: n })}
                      className={pill(filters.bedrooms === n)}
                    >
                      {n === 0 ? "Any" : `${n}+`}
                    </button>
                  ))}
                </div>
              </Group>

              <Group title="Amenities">
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => {
                    const on = filters.amenities.includes(a.key);
                    return (
                      <button
                        key={a.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          onChange({
                            amenities: on ? filters.amenities.filter((x) => x !== a.key) : [...filters.amenities, a.key],
                          })
                        }
                        className={pill(on)}
                      >
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </Group>
            </div>

            <footer className="flex items-center justify-between border-t border-border px-6 py-4">
              <button type="button" onClick={onClear} className="text-sm underline underline-offset-4">
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                Show {resultCount} {resultCount === 1 ? "stay" : "stays"}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
