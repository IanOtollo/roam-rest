"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toKey, todayKey } from "@/lib/availability";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Month({
  year,
  month,
  start,
  end,
  onPick,
}: {
  year: number;
  month: number;
  start: string | null;
  end: string | null;
  onPick: (key: string) => void;
}) {
  const today = todayKey();
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
    <div className="w-64">
      <p className="mb-3 text-center font-serif text-base">{title}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-1.5">
            {w}
          </span>
        ))}
        {cells.map((key, i) => {
          if (!key) return <span key={`b${i}`} />;
          const past = key < today;
          const isStart = key === start;
          const isEnd = key === end;
          const inRange = !!start && !!end && key > start && key < end;
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              onClick={() => onPick(key)}
              aria-label={key}
              aria-pressed={isStart || isEnd}
              className={cn(
                "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                !past && "hover:bg-muted",
                past && "text-muted-foreground/40",
                inRange && "rounded-none bg-muted",
                (isStart || isEnd) && "bg-primary text-primary-foreground hover:bg-primary",
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

/** Plain check-in / check-out picker used by the home-page search. No availability coupling. */
export function RangeCalendar({
  start,
  end,
  onChange,
  months = 2,
}: {
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  months?: 1 | 2;
}) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const second = new Date(first.getFullYear(), first.getMonth() + 1, 1);

  function pick(key: string) {
    if (!start || (start && end)) return onChange(key, null);
    if (key <= start) return onChange(key, null);
    onChange(start, key);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Previous month"
          className="rounded-full border border-border p-1.5 transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(18, o + 1))}
          aria-label="Next month"
          className="rounded-full border border-border p-1.5 transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className={cn("flex gap-8", months === 1 && "justify-center")}>
        <Month year={first.getFullYear()} month={first.getMonth()} start={start} end={end} onPick={pick} />
        {months === 2 && (
          <div className="hidden md:block">
            <Month year={second.getFullYear()} month={second.getMonth()} start={start} end={end} onPick={pick} />
          </div>
        )}
      </div>
    </div>
  );
}
