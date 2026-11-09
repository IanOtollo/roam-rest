"use client";

import { cn } from "@/lib/utils";
import type { LocationGroup } from "@/lib/search";

const pill = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors active:scale-[0.98]",
    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
  );

/**
 * Where to stay: "Anywhere" plus one chip per city (with how many stays it has). Choosing a city
 * with several areas reveals a second row to narrow it down, e.g. Kilifi, then Vipingo.
 * `value` is "" (anywhere), a city, or "Area, City", the same values the search filter uses.
 */
export function PlacePicker({
  groups,
  total,
  value,
  onChange,
  className,
  scroll = false,
}: {
  groups: LocationGroup[];
  total: number;
  value: string;
  onChange: (where: string) => void;
  className?: string;
  /** One scrolling line (page) instead of wrapping (panel). */
  scroll?: boolean;
}) {
  const active = groups.find((g) => g.city === value || g.areas.some((a) => a.value === value));
  const row = cn("flex gap-2", scroll ? "overflow-x-auto pb-1" : "flex-wrap");

  return (
    <div className={cn("space-y-2", className)}>
      <div className={row} role="group" aria-label="Place">
        <button type="button" aria-pressed={value === ""} onClick={() => onChange("")} className={pill(value === "")}>
          Anywhere <span className="opacity-60">· {total}</span>
        </button>
        {groups.map((g) => (
          <button
            key={g.city}
            type="button"
            aria-pressed={active?.city === g.city}
            onClick={() => onChange(g.city)}
            className={pill(active?.city === g.city)}
          >
            {g.city} <span className="opacity-60">· {g.count}</span>
          </button>
        ))}
      </div>

      {active && active.areas.length > 1 && (
        <div className={row} role="group" aria-label={`Areas in ${active.city}`}>
          <button
            type="button"
            aria-pressed={value === active.city}
            onClick={() => onChange(active.city)}
            className={pill(value === active.city)}
          >
            All of {active.city}
          </button>
          {active.areas.map((a) => (
            <button
              key={a.value}
              type="button"
              aria-pressed={value === a.value}
              onClick={() => onChange(a.value)}
              className={pill(value === a.value)}
            >
              {a.area} <span className="opacity-60">· {a.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
