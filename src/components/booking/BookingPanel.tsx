"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Minus, Plus, X } from "lucide-react";
import { cn, ease, formatKES } from "@/lib/utils";
import { brand, hasRate } from "@/lib/property";
import { useBooking } from "./BookingContext";
import { Calendar } from "./Calendar";
import { ShareButton } from "@/components/ui/ShareButton";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";

const fmt = (key: string | null) =>
  key
    ? new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "Add date";

export function BookingPanel() {
  const { property, unit, unitData: u, setUnit, start, end, guests, setGuests, clear, hint, nights, total } =
    useBooking();
  const ready = !!(start && end);

  // Date picker popover: opens from the Check-in / Check-out boxes, closes on any outside tap,
  // Escape, or once both dates are chosen. The page behind stays scrollable.
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  // Only when a check-out is newly chosen, so reopening to change dates doesn't snap shut.
  useEffect(() => {
    if (!end) return;
    const id = window.setTimeout(() => setOpen(false), 450);
    return () => window.clearTimeout(id);
  }, [end]);
  const activeField = !start || end ? "in" : "out";
  const stay = property.units.length > 1 ? `${u.label} at ${property.title}` : property.title;

  const priced = hasRate(u);
  const message = ready
    ? `Hello! I'd like to book ${stay} on ${brand.name} from ${fmt(start)} to ${fmt(end)} (${nights} nights) for ${guests} guest${guests > 1 ? "s" : ""}.${priced ? ` Total shown: ${formatKES(total)}.` : " Could you share the rate?"}`
    : `Hello! I'd like to book ${stay} on ${brand.name} for ${guests} guest${guests > 1 ? "s" : ""}. Could you share the available dates?`;
  const href = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div
      id="book"
      className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 shadow-[0_24px_80px_-32px_hsl(var(--foreground)/0.25)] sm:p-8"
    >
      <div className="flex items-baseline justify-between">
        {priced ? (
          <p className="font-serif text-3xl tracking-tight">
            {formatKES(u.nightlyRate)}
            <span className="ml-1 font-sans text-sm text-muted-foreground">/ night</span>
          </p>
        ) : (
          <p className="font-serif text-2xl tracking-tight">Book this stay</p>
        )}
        <ShareButton label={false} className="p-2.5" />
      </div>

      {/* Unit switch */}
      {property.units.length > 1 && (
        <div
          role="tablist"
          aria-label="Choose what to book"
          className="mt-6 grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-muted p-1"
        >
          {property.units.map((x) => {
            const active = x.id === unit;
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setUnit(x.id)}
                className="relative rounded-xl px-2 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm"
              >
                {active && (
                  <motion.span
                    layoutId="unit-pill"
                    className="absolute inset-0 rounded-xl bg-background shadow-sm"
                    transition={{ duration: 0.4, ease }}
                  />
                )}
                <span className="relative block">{x.bedrooms} BR</span>
                <span className="relative block text-[0.65rem] font-normal text-muted-foreground sm:text-xs">
                  {x.tab}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={unit}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {u.note} {u.bedrooms} beds · {u.bathrooms} baths · up to {u.maxGuests} guests.
        </motion.p>
      </AnimatePresence>

      {/* Dates */}
      <div ref={pickerRef} className="mt-6">
        <div
          className={cn(
            "grid grid-cols-2 overflow-hidden rounded-xl border transition-colors",
            open ? "border-foreground/60" : "border-border",
          )}
        >
          {(
            [
              { id: "in", label: "Check-in", value: start },
              { id: "out", label: "Check-out", value: end },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setOpen((o) => (o && activeField === f.id ? false : true))}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                "p-4 text-left transition-colors hover:bg-muted/50",
                f.id === "in" && "border-r border-border",
                open && activeField === f.id && "bg-muted/60",
              )}
            >
              <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                {f.label}
              </span>
              <span className="text-sm">{fmt(f.value)}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-label="Choose your dates"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-2xl border border-border bg-background p-4">
              {property.availabilityKnown === false && (
                <p role="status" className="mb-3 text-xs text-accent">
                  Live availability couldn&apos;t be loaded, so please confirm dates by message.
                </p>
              )}
              <Calendar single />
              <p role="status" className="mt-3 min-h-5 text-sm text-accent">
                {hint ?? (nights > 0 ? `${nights} nights selected.` : `${property.minNights}-night minimum`)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <button type="button" onClick={clear} className="text-muted-foreground underline-offset-4 hover:underline">
                  Clear dates
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                >
                  Close
                </button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Guests */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">Guests</p>
          <p className="text-sm">
            {guests} guest{guests > 1 ? "s" : ""}
            <span className="text-muted-foreground"> · max {u.maxGuests}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer guests"
            onClick={() => setGuests(guests - 1)}
            disabled={guests <= 1}
            className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="More guests"
            onClick={() => setGuests(guests + 1)}
            disabled={guests >= u.maxGuests}
            className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hint && !open && (
        <p role="status" className="mt-3 text-sm text-accent">
          {hint}
        </p>
      )}

      {/* Status + total */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {ready ? "Available for your dates" : `Pick dates · ${property.minNights}-night minimum`}
          </span>
          {ready && (
            <button type="button" onClick={clear} className="flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <AnimatePresence>
          {ready && priced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease }}
              className="overflow-hidden"
            >
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatKES(u.nightlyRate)} × {nights} nights
                  </span>
                  <span>{formatKES(total)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatKES(total)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/*
        Two ways to book. With dates picked, the main button reserves on WhatsApp with the dates
        and total filled in. Without dates it first asks for them, and "Book via WhatsApp" stays
        available for guests who would rather just message the host.
      */}
      {ready ? (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <WhatsAppIcon className="h-4 w-4" /> Reserve on WhatsApp
        </motion.a>
      ) : (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Select your dates
        </motion.button>
      )}
      {!ready && (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm transition-colors hover:bg-muted"
        >
          <WhatsAppIcon className="h-4 w-4" /> Book via WhatsApp
        </motion.a>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        No account needed. You won't be charged yet; the host confirms by message.
      </p>
    </div>
  );
}
