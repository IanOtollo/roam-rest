"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, nightsBetween, toKey, todayKey } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { formatDay } from "./ui";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export type Occupied = { id: string; start: string; end: string; label: string };

/**
 * Pick a check-in and check-out on a calendar. Nights that are already taken for the
 * chosen option are shown as filled bars (one bar per booking, with rounded ends) and can't
 * be picked, so a clash can't happen. `occupiedBy(night)` returns the booking holding it.
 */
export function AvailabilityCalendar({
  start,
  end,
  onChange,
  occupiedBy,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  occupiedBy: (night: string) => Occupied | undefined;
}) {
  const isTaken = (night: string) => !!occupiedBy(night);
  const today = todayKey();
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);

  const rangeFree = (a: string, b: string) => {
    for (let d = a; d < b; d = addDays(d, 1)) if (isTaken(d)) return false;
    return true;
  };

  function pick(key: string) {
    if (!start || end) return onChange(key, "");
    if (key <= start || !rangeFree(start, key)) return onChange(key, "");
    onChange(start, key);
  }

  return (
    <div className="rounded-2xl border border-border/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Previous month"
          className="rounded-full border border-border p-2 transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {start && end
            ? `${formatDay(start)} to ${formatDay(end)} · ${nightsBetween(start, end)} ${nightsBetween(start, end) === 1 ? "night" : "nights"}`
            : start
              ? `Check-in ${formatDay(start)}. Now pick the check-out day.`
              : "Pick the check-in day, then the check-out day."}
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(24, o + 1))}
          aria-label="Next month"
          className="rounded-full border border-border p-2 transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Month year={base.getFullYear()} month={base.getMonth()} {...{ start, end, today, occupiedBy, pick }} />
        <div className="hidden md:block">
          <Month year={next.getFullYear()} month={next.getMonth()} {...{ start, end, today, occupiedBy, pick }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="relative h-3 w-5 overflow-hidden rounded-md bg-accent/30"><span className="absolute inset-x-0 top-1/2 h-px rotate-12 bg-foreground/40" /></span> Already booked (hover or tap a bar to see who)
        </span>
      </div>
    </div>
  );
}

function Month({
  year,
  month,
  start,
  end,
  today,
  occupiedBy,
  pick,
}: {
  year: number;
  month: number;
  start: string;
  end: string;
  today: string;
  occupiedBy: (night: string) => Occupied | undefined;
  pick: (key: string) => void;
}) {
  const isTaken = (night: string) => !!occupiedBy(night);
  const cells = useMemo(() => {
    const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
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
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-2">
            {w}
          </span>
        ))}
        {cells.map((key, i) => {
          if (!key) return <span key={`b${i}`} />;
          const past = key < today;
          const here = past ? undefined : occupiedBy(key);
          const taken = !!here;
          // A taken night can still be a check-out morning if the night before is free.
          const canCheckout = !past && !!start && !end && key > start && !isTaken(addDays(key, -1));
          const disabled = past || (taken && !canCheckout);
          const isStart = key === start;
          const isEnd = key === end;
          const inRange = !!start && !!end && key > start && key < end;
          // Booked nights form one bar per booking; round the bar where it begins, ends or wraps a row.
          const col = (n: number) => n % 7;
          const prev = i > 0 ? cells[i - 1] : null;
          const nextKey = i < cells.length - 1 ? cells[i + 1] : null;
          const joinsPrev = !!here && !!prev && col(i) !== 0 && occupiedBy(prev)?.id === here.id;
          const joinsNext = !!here && !!nextKey && col(i) !== 6 && occupiedBy(nextKey)?.id === here.id;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => pick(key)}
              title={here ? `${here.label} · ${formatDay(here.start)} to ${formatDay(here.end)}` : undefined}
              aria-label={`${key}${here ? `, booked: ${here.label}` : ""}`}
              aria-pressed={isStart || isEnd}
              className={cn(
                "relative mx-auto flex aspect-square w-full items-center justify-center text-sm transition-colors duration-200",
                taken ? "max-w-none" : "max-w-10 rounded-full",
                !disabled && "hover:bg-muted",
                past && "text-muted-foreground/40",
                taken && "bg-accent/30 font-medium text-foreground/70",
                taken && !joinsPrev && "rounded-l-xl",
                taken && !joinsNext && "rounded-r-xl",
                taken && disabled && "cursor-not-allowed",
                inRange && "rounded-none bg-muted",
                (isStart || isEnd) && "rounded-full bg-primary text-primary-foreground hover:bg-primary",
                key === today && !isStart && !isEnd && "ring-1 ring-border",
              )}
            >
              {taken && (
                <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span className="h-0.5 w-1/2 rotate-45 rounded-full bg-foreground/40" />
                </span>
              )}
              <span className="relative">{Number(key.slice(8))}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
