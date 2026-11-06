"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Minus, Plus, X } from "lucide-react";
import { cn, ease, formatKES } from "@/lib/utils";
import { brand } from "@/lib/property";
import { useBooking } from "./BookingContext";
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
  const stay = property.units.length > 1 ? `${u.label} at ${property.title}` : property.title;

  const message = ready
    ? `Hello! I'd like to book ${stay} on ${brand.name} from ${fmt(start)} to ${fmt(end)} (${nights} nights) for ${guests} guest${guests > 1 ? "s" : ""}. Total shown: ${formatKES(total)}.`
    : `Hello! I'd like to book ${stay} on ${brand.name} for ${guests} guest${guests > 1 ? "s" : ""}. Could you share the available dates?`;
  const href = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div
      id="book"
      className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 shadow-[0_24px_80px_-32px_hsl(var(--foreground)/0.25)] sm:p-8"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-3xl tracking-tight">
          {formatKES(u.nightlyRate)}
          <span className="ml-1 font-sans text-sm text-muted-foreground">/ night</span>
        </p>
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
      <a
        href="#availability"
        className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border transition-colors hover:bg-muted/50"
      >
        <span className="border-r border-border p-4">
          <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">Check-in</span>
          <span className="text-sm">{fmt(start)}</span>
        </span>
        <span className="p-4">
          <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">Check-out</span>
          <span className="text-sm">{fmt(end)}</span>
        </span>
      </a>

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

      {hint && (
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
          {ready && (
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
      <motion.a
        href={ready ? href : "#availability"}
        {...(ready ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:opacity-90",
        )}
      >
        {ready ? (
          <>
            <WhatsAppIcon className="h-4 w-4" /> Reserve on WhatsApp
          </>
        ) : (
          "Select your dates"
        )}
      </motion.a>
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
