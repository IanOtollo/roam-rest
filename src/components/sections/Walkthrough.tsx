"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ease } from "@/lib/utils";
import type { WalkthroughRoom } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";

const SWIPE_THRESHOLD = 60;
const AUTOPLAY_MS = 4900;

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 64 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -64 }),
};

function Slideshow({ rooms }: { rooms: WalkthroughRoom[] }) {
  const reduce = useReducedMotion();
  const count = rooms.length;
  const [[active, dir], setSlide] = useState<[number, number]>([0, 1]);

  const go = useCallback(
    (to: number) =>
      setSlide(([cur]) => {
        const next = (to + count) % count;
        return [next, to >= cur ? 1 : -1];
      }),
    [count],
  );
  const step = useCallback(
    (d: number) => setSlide(([cur]) => [(cur + d + count) % count, d]),
    [count],
  );

  const room = rooms[active];

  // Autoplay: advances every few seconds; pauses only via the pause button. Any manual change restarts the timer (`active` is a dependency).
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing || count < 2) return;
    const id = window.setTimeout(() => step(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, active, count, step]);

  return (
    <div
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Photo slideshow"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      className="relative h-screen min-h-[36rem] outline-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.18),transparent_60%)]" />

      {/* Header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-7xl items-start justify-between px-4 pt-20 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-widest on-night-60">Walk through</p>
          <p className="mt-1 font-serif text-2xl tracking-tight">Wander the house</p>
        </div>
        <p className="font-serif text-2xl tabular-nums tracking-tight" aria-live="polite">
          {String(active + 1).padStart(2, "0")}
          <span className="on-night-40"> / {String(count).padStart(2, "0")}</span>
        </p>
      </div>

      {/* Stage: full container width, wide frame */}
      <div
        className="absolute inset-0 overflow-hidden"
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={room.src}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.2 : 0.5, ease }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) step(1);
              else if (info.offset.x > SWIPE_THRESHOLD) step(-1);
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={room.src}
              alt={room.title}
              fill
              quality={90}
              priority
              sizes="100vw"
              draggable={false}
              className="pointer-events-none select-none object-contain"
            />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-6 pt-16 text-white sm:px-8 sm:pb-8">
              <p className="font-serif text-2xl tracking-tight">{room.title}</p>
              <p className="text-xs uppercase tracking-widest opacity-70">{room.where}</p>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots + mobile arrows */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-4 px-4 pb-6">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="rounded-full border border-border/40 p-2 sm:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {rooms.map((r, i) => (
            <button
              key={r.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${r.title}`}
              aria-current={i === active}
              className="p-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-accent" : "w-1.5 on-night-line bg-current opacity-40"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="rounded-full border border-border/40 p-2 sm:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className="rounded-full border border-border/40 p-2 transition-colors hover:bg-muted/20"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function Walkthrough() {
  const { property } = useBooking();
  if (property.walkthrough.length === 0) return null;
  return (
    <section id="walkthrough" aria-label={`Photo walkthrough of ${property.title}`} className="on-night bg-night">
      <Slideshow rooms={property.walkthrough} />
    </section>
  );
}
