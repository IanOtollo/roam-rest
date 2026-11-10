"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { getUnit, type Property } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";
import { Stars } from "@/components/ui/Stars";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { ease } from "@/lib/utils";

type Review = Property["reviews"][number];

/** A playing-card sized face (5 : 7): stars at the top, the quote in the middle, the guest at the bottom. */
const CARD = "relative aspect-[5/7] w-[min(18rem,calc((100svh-16rem)*5/7))] min-w-[12rem] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xl";

/** One of the stay's own photos fills the card, under a dark veil so the words stay easy to read. */
function photoFor(property: Property, i: number) {
  const pool = [property.cover, ...property.walkthrough.map((w) => w.src)];
  return pool[(i * 3) % pool.length];
}

function ReviewCard({ r, property, photo }: { r: Review; property: Property; photo: string }) {
  const long = r.quote.length > 200;
  return (
    <>
      <Image src={photo} alt="" fill sizes="320px" quality={80} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black/75" />
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/30 p-4 text-white">
        <div>{r.rating ? <Stars value={r.rating} /> : null}</div>
        <p
          className={`min-h-0 overflow-y-auto font-serif leading-snug tracking-tight [text-shadow:0_1px_6px_rgb(0_0_0/0.5)] ${long ? "text-sm" : "text-lg"}`}
        >
          &ldquo;{r.quote}&rdquo;
        </p>
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <BadgeCheck className="h-4 w-4 shrink-0 text-amber-300" /> {r.author}
          </p>
          <p className="text-xs text-white/75">
            Stayed {r.stayed} · {r.nights} {r.nights === 1 ? "night" : "nights"} · {getUnit(property, r.unit).label}
          </p>
        </div>
      </div>
    </>
  );
}

const SWIPE = 50;
const SHUFFLE_MS = 5800;

/** Several reviews: a stack of cards that shuffles every few seconds. Tap or swipe to move on sooner. */
function Stack({ reviews, property }: { reviews: Review[]; property: Property }) {
  const [top, setTop] = useState(0);
  const n = reviews.length;
  const go = (d: number) => setTop((t) => (t + d + n) % n);
  const reduce = useReducedMotion();
  const [held, setHeld] = useState(false);

  // The stack shuffles on its own; it waits while a visitor is hovering or touching it.
  useEffect(() => {
    if (held || reduce) return;
    const id = window.setTimeout(() => setTop((t) => (t + 1) % n), SHUFFLE_MS);
    return () => window.clearTimeout(id);
  }, [held, reduce, top, n]);

  return (
    <div className="flex justify-center">
      <ul
        className="grid justify-items-center pb-10 pr-6"
        role="group"
        aria-roledescription="carousel"
        aria-label="Guest reviews"
        tabIndex={0}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {reviews.map((r, i) => {
          const depth = (i - top + n) % n;
          const front = depth === 0;
          const shown = depth < 3;
          return (
            <motion.li
              key={r.id}
              aria-hidden={!front}
              initial={false}
              animate={{
                x: shown ? depth * 12 : 24,
                y: shown ? depth * 8 : 16,
                rotate: shown ? depth * 4 : 8,
                scale: shown ? 1 - depth * 0.03 : 0.9,
                opacity: shown ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease }}
              drag={front && n > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE) go(1);
                else if (info.offset.x > SWIPE) go(-1);
              }}
              onClick={() => front && go(1)}
              style={{ zIndex: n - depth, gridArea: "1 / 1", pointerEvents: front ? "auto" : "none" }}
              className={`${CARD} self-start ${front ? "cursor-pointer" : ""}`}
            >
              <ReviewCard r={r} property={property} photo={photoFor(property, i)} />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Hidden entirely until at least one verified guest has reviewed the stay. */
export function Reviews() {
  const { property } = useBooking();
  if (property.reviews.length === 0) return null;

  return (
    <Reveal>
      <SectionHeading eyebrow="Guest reviews" title="What guests say" />
      {property.reviews.length === 1 ? (
        <div className={`${CARD} mx-auto`}>
          <ReviewCard r={property.reviews[0]} property={property} photo={photoFor(property, 0)} />
        </div>
      ) : (
        <Stack reviews={property.reviews} property={property} />
      )}
    </Reveal>
  );
}
