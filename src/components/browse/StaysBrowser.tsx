"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/sections/PropertyCard";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Property } from "@/lib/property";
import {
  activeFilterCount,
  amenityOptions,
  anyFilterActive,
  emptyFilters,
  filterProperties,
  locationGroups,
  maxBedrooms,
  maxGuests,
  priceBounds,
  type Filters,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import { FilterModal } from "./FilterModal";
import { SortMenu } from "./SortMenu";

/**
 * Home-page browse experience: search bar, quick filters and a compact grid of
 * listings. Everything is derived from the property data, so adding a property
 * adds it here automatically.
 */
export function StaysBrowser({ properties }: { properties: Property[] }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const clear = () => setFilters(emptyFilters);

  const places = useMemo(() => locationGroups(properties), [properties]);
  const amenities = useMemo(() => amenityOptions(properties), [properties]);
  const bounds = useMemo(() => priceBounds(properties), [properties]);
  const matches = useMemo(() => filterProperties(properties, filters), [properties, filters]);
  const activeCount = activeFilterCount(filters);

  const toggleAmenity = (key: string) =>
    patch({
      amenities: filters.amenities.includes(key) ? filters.amenities.filter((x) => x !== key) : [...filters.amenities, key],
    });

  // Quick chips: the most common amenities, plus any chosen ones so a selection never disappears.
  const quick = useMemo(() => {
    const top = amenities.slice(0, 6);
    const chosen = amenities.filter((a) => filters.amenities.includes(a.key) && !top.some((t) => t.key === a.key));
    return [...top, ...chosen];
  }, [amenities, filters.amenities]);

  return (
    <div>
      <Reveal>
        <SectionHeading eyebrow="Stays" title="Find your next place to rest" />
      </Reveal>

      {/* Filters + quick amenity chips */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted active:scale-[0.98]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quick.map((a) => {
            const on = filters.amenities.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleAmenity(a.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors active:scale-[0.98]",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                )}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {matches.length} {matches.length === 1 ? "stay" : "stays"}
            {anyFilterActive(filters) && (
              <button type="button" onClick={clear} className="ml-3 text-foreground underline underline-offset-4">
                Clear all
              </button>
            )}
          </p>
          <SortMenu value={filters.sort} onChange={(sort) => patch({ sort })} />
        </div>

        {matches.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {matches.map((m, i) => (
                <PropertyCard
                  key={m.property.slug}
                  match={m}
                  index={i}
                  guests={filters.guests}
                  start={filters.start}
                  end={filters.end}
                />
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <p className="font-serif text-2xl tracking-tight">No stays match those filters</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try different dates, fewer guests or a wider price range.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={patch}
        onClear={clear}
        resultCount={matches.length}
        bounds={bounds}
        bedroomMax={maxBedrooms(properties)}
        amenities={amenities}
        places={places}
        total={properties.length}
        guestMax={maxGuests(properties)}
      />
    </div>
  );
}
