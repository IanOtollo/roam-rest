"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bath, BedDouble, ChevronLeft, ChevronRight, MapPin, Users, Waves } from "lucide-react";
import { cn, ease, formatKES } from "@/lib/utils";
import { startingRate, type Property } from "@/lib/property";
import { ArchStack } from "./ArchStack";

const AUTOPLAY_MS = 6000;
/** Leaves room under the artwork for the caption, specification chips and dots. */
const ARCH_HEIGHT = "[--h:clamp(16rem,calc(100svh-16rem),34rem)]";

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60, rotateY: dir * -12 }),
  center: { opacity: 1, x: 0, rotateY: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60, rotateY: dir * 12 }),
};

function Arrow({ side, onClick, disabled }: { side: "left" | "right"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous stay" : "Next stay"}
      aria-disabled={disabled}
      title={disabled ? "More stays coming soon" : undefined}
      onClick={() => !disabled && onClick()}
      className={cn(
        "group absolute top-[calc(var(--h)/2)] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-muted active:scale-95",
        "aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:scale-100 aria-disabled:hover:bg-card/90",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      {side === "left" ? (
        <ChevronLeft className={cn("h-5 w-5", !disabled && "arrow-left")} />
      ) : (
        <ChevronRight className={cn("h-5 w-5", !disabled && "arrow-right")} />
      )}
    </button>
  );
}

/** The specifications shown under each slide, all derived from the property's data. */
function Specs({ property }: { property: Property }) {
  const bedrooms = Math.max(...property.units.map((u) => u.bedrooms));
  const baths = Math.max(...property.units.map((u) => u.bathrooms));
  const chips = [
    { icon: Users, label: `Sleeps ${property.maxGuests}` },
    { icon: BedDouble, label: `${bedrooms} bedrooms` },
    { icon: Bath, label: `${baths} baths` },
    ...property.highlights.map((label) => ({ icon: Waves, label })),
  ];
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {chips.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5 text-accent" /> {label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Home hero artwork: one 3D arch stack per property, cycling automatically through the
 * collection. Side arrows (and dots, swipe and arrow keys) let visitors move on their own;
 * autoplay pauses while they hover or focus. With a single property the arrows are shown
 * dimmed, and they become active as soon as another property is added.
 */
export function PropertyCarousel({ properties }: { properties: Property[] }) {
  const count = properties.length;
  const many = count > 1;
  const reduce = useReducedMotion();
  const [[index, dir], setPage] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: number) => setPage(([i]) => [(i + step + count) % count, step > 0 ? 1 : -1]),
    [count],
  );
  const goTo = (target: number) => setPage(([i]) => [target, target >= i ? 1 : -1]);

  // Autoplay. The timer restarts after every change, so a manual click gets a full interval.
  useEffect(() => {
    if (!many || paused || reduce) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [many, paused, reduce, go, index]);

  const current = properties[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured stays"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      className={cn("perspective-1000", ARCH_HEIGHT)}
    >
      <div className="relative">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={current.slug}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease }}
            aria-live="polite"
          >
            <Link href={`/stays/${current.slug}`} aria-label={`View ${current.title}`} className="block">
              <ArchStack images={current.heroImages} heightClass={ARCH_HEIGHT} />
            </Link>

            <div className="mx-auto mt-4 max-w-lg">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl tracking-tight">{current.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {current.area}, {current.city} · from{" "}
                    {formatKES(startingRate(current))} / night
                  </p>
                </div>
                <Link
                  href={`/stays/${current.slug}`}
                  className="group flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted active:scale-[0.98]"
                >
                  View stay <ArrowRight className="arrow-right h-4 w-4" />
                </Link>
              </div>
              <Specs property={current} />
            </div>
          </motion.div>
        </AnimatePresence>

        <Arrow side="left" onClick={() => go(-1)} disabled={!many} />
        <Arrow side="right" onClick={() => go(1)} disabled={!many} />
      </div>

      {many && (
        <div className="mx-auto mt-4 flex max-w-lg items-center gap-2" role="tablist" aria-label="Choose a stay">
          {properties.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={p.title}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-8 bg-primary" : "w-3 bg-border hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
