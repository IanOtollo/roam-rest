"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ease } from "@/lib/utils";
import type { WalkthroughRoom } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";

/** Distance between rooms along the "corridor" (px in 3D space). */
const DEPTH = 750;

function Plane({ room, index, cam }: { room: WalkthroughRoom; index: number; cam: MotionValue<number> }) {
  // Where this frame sits relative to the camera. 0 = at the glass, negative = further away.
  const rel = useTransform(cam, (c) => c - index * DEPTH - 300);
  // Several frames are visible at once (near ones bright, distant ones fading) so the hall never looks empty.
  const opacity = useTransform(rel, [-3200, -1900, -300, 200, 550], [0, 0.55, 1, 1, 0]);
  const side = index % 2 === 0 ? -1 : 1;

  return (
    <div className="preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.figure style={{ z: rel, opacity, x: `${side * 62}%` }} className="w-[min(60vw,20rem,34vh)]">
        <div className="overflow-hidden rounded-t-full shadow-[0_50px_120px_-30px_hsl(var(--accent)/0.45)]">
          <Image
            src={room.src}
            alt={room.title}
            width={960}
            height={1280}
            sizes="(min-width: 640px) 320px, 60vw"
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
        <figcaption className="mt-4 text-center">
          <p className="font-serif text-xl tracking-tight on-night">{room.title}</p>
          <p className="text-xs uppercase tracking-widest on-night-60">{room.where}</p>
        </figcaption>
      </motion.figure>
    </div>
  );
}

function Corridor({ rooms }: { rooms: WalkthroughRoom[] }) {
  const count = rooms.length;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, (count - 1) * DEPTH + 300]);
  const cam = useSpring(raw, { stiffness: 70, damping: 24, mass: 0.6 });

  const [active, setActive] = useState(0);
  useMotionValueEvent(cam, "change", (c) => {
    const i = Math.max(0, Math.min(count - 1, Math.round(c / DEPTH)));
    setActive((prev) => (prev === i ? prev : i));
  });

  // Pointer "look around"
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);

  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    // Scroll length scales with the number of photos so short galleries aren't padded out.
    <div ref={ref} style={{ height: `${count * 80}vh` }} className="relative">
      <div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
        }}
        className="perspective-1200 sticky top-0 h-screen overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.18),transparent_60%)]" />

        <motion.div style={{ rotateX, rotateY }} className="preserve-3d absolute inset-0">
          {rooms.map((room, i) => (
            <Plane key={room.src} room={room} index={i} cam={cam} />
          ))}
        </motion.div>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-7xl items-start justify-between px-4 pt-20 on-night sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-widest on-night-60">Walk through</p>
            <p className="mt-1 font-serif text-2xl tracking-tight">Scroll to wander the house</p>
          </div>
          <p className="font-serif text-2xl tabular-nums tracking-tight">
            {String(active + 1).padStart(2, "0")}
            <span className="on-night-40"> / {String(count).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
              className="text-sm on-night-70"
            >
              {rooms[active].where} · {rooms[active].title}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 h-px w-full on-night-line">
            <motion.div style={{ width: progress }} className="h-px bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Simple grid for visitors who prefer reduced motion. */
function StaticGallery({ rooms }: { rooms: WalkthroughRoom[] }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {rooms.map((r) => (
        <figure key={r.src}>
          <Image
            src={r.src}
            alt={r.title}
            width={960}
            height={1280}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="aspect-[3/4] w-full rounded-t-full object-cover"
          />
          <figcaption className="mt-3 text-center">
            <p className="font-serif text-lg on-night">{r.title}</p>
            <p className="text-xs uppercase tracking-widest on-night-60">{r.where}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Walkthrough() {
  const reduce = useReducedMotion();
  const { property } = useBooking();
  if (property.walkthrough.length === 0) return null;
  return (
    <section id="walkthrough" aria-label={`Photo walkthrough of ${property.title}`} className="on-night bg-night">
      {reduce ? <StaticGallery rooms={property.walkthrough} /> : <Corridor rooms={property.walkthrough} />}
    </section>
  );
}
