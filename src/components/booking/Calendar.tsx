"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, isNightBooked, toKey, todayKey } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { useBooking } from "./BookingContext";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function MonthGrid({ year, month }: { year: number; month: number }) {
  const { property, unit, start, end, pick } = useBooking();
  const today = todayKey();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => toKey(new Date(year, month, i + 1))),
    ];
  }, [year, month]);

  const title = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="w-full">
      <p className="mb-4 text-center font-serif text-lg">{title}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-2">
            {w}
          </span>
        ))}
        {cells.map((key, i) => {
          if (!key) return <span key={`b${i}`} />;
          const past = key < today;
          const booked = !past && isNightBooked(property, unit, key);
          // A booked night can still be a checkout morning if the night before is free.
          const canCheckout =
            !past && !!start && !end && key > start && !isNightBooked(property, unit, addDays(key, -1));
          const disabled = past || (booked && !canCheckout);
          const isStart = key === start;
          const isEnd = key === end;
          const inRange = !!start && !!end && key > start && key < end;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => pick(key)}
              aria-label={`${key}${booked ? ", booked" : ""}`}
              aria-pressed={isStart || isEnd}
              className={cn(
                "max-w-10",
                "relative mx-auto flex aspect-square w-full items-center justify-center rounded-full text-sm transition-colors duration-200",
                !disabled && "hover:bg-muted",
                past && "text-muted-foreground/40",
                booked && "text-muted-foreground/60 line-through decoration-accent/70",
                inRange && "rounded-none bg-muted",
                (isStart || isEnd) && "bg-primary text-primary-foreground hover:bg-primary",
                key === today && !isStart && !isEnd && "ring-1 ring-border",
              )}
            >
              {Number(key.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Calendar({ single = false }: { single?: boolean }) {
  const { property } = useBooking();
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Previous month"
          className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(18, o + 1))}
          aria-label="Next month"
          className="rounded-full border border-border p-2 transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className={cn("grid gap-8", !single && "md:grid-cols-2")}>
        <MonthGrid year={base.getFullYear()} month={base.getMonth()} />
        {!single && (
          <div className="hidden md:block">
            <MonthGrid year={next.getFullYear()} month={next.getMonth()} />
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" /> Your dates
        </span>
        {property.bookings.length > 0 && (
          <span className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground/60 line-through decoration-accent/70">12</span> Booked
          </span>
        )}
      </div>
    </div>
  );
}
