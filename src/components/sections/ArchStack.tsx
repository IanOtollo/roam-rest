"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ease } from "@/lib/utils";
import type { Property } from "@/lib/property";

/**
 * Three arched "windows" at different depths. Pointer movement tilts the whole
 * stack in 3D while each photo slides inside its frame, so the room appears to
 * recede behind the glass.
 */
/** Default stack height: fills the hero but never exceeds the viewport. */
const DEFAULT_HEIGHT = "[--h:min(36rem,calc(100svh-8rem))]";

/**
 * Six compositions for the same three photos. Each property gets one of them (see `heroVariant`),
 * so neighbouring properties in the hero carousel never look alike. Positions are percentages of
 * the stack, kept inset because perspective scales the nearer layers up.
 */
type Layout = { back: string; main: string; front: string };
const LAYOUTS: Layout[] = [
  // 0 · Arches: tall arch on the left, two arches stacked on the right.
  {
    main: "left-0 top-[3%] h-[94%] w-[64%] rounded-t-full",
    back: "right-0 top-[3%] h-[45%] w-[32%] rounded-t-full",
    front: "bottom-[3%] right-0 h-[45%] w-[32%] rounded-t-full",
  },
  // 1 · Orbs: a tall oval on the right, two ovals stacked on the left.
  {
    main: "right-0 top-[3%] h-[94%] w-[64%] rounded-full",
    back: "left-0 top-[3%] h-[45%] w-[32%] rounded-full",
    front: "bottom-[3%] left-0 h-[45%] w-[32%] rounded-full",
  },
  // 2 · Windows: a tall pane on the right, an arch and a pane on the left.
  {
    main: "right-0 top-[3%] h-[94%] w-[64%] rounded-3xl",
    back: "left-0 top-[3%] h-[45%] w-[32%] rounded-t-full",
    front: "bottom-[3%] left-0 h-[45%] w-[32%] rounded-2xl",
  },
  // 3 · Offset: an arch on the left, a round-topped and a round-bottomed card on the right.
  {
    main: "left-0 top-[3%] h-[94%] w-[64%] rounded-t-full",
    back: "right-0 top-[3%] h-[40%] w-[32%] rounded-full",
    front: "bottom-[3%] right-0 h-[50%] w-[32%] rounded-b-full",
  },
  // 4 · Leaf: a leaf-shaped centre on the left, a soft square and an arch on the right.
  {
    main: "left-0 top-[3%] h-[94%] w-[64%] rounded-tl-full rounded-br-full rounded-bl-xl rounded-tr-xl",
    back: "right-0 top-[3%] h-[42%] w-[32%] rounded-2xl",
    front: "bottom-[3%] right-0 h-[48%] w-[32%] rounded-t-full",
  },
  // 5 · Hanging arches: arches turned upside down, main on the right.
  {
    main: "right-0 top-[3%] h-[94%] w-[64%] rounded-b-full",
    back: "left-0 top-[3%] h-[45%] w-[32%] rounded-b-full",
    front: "bottom-[3%] left-0 h-[45%] w-[32%] rounded-b-full",
  },
];

/**
 * Stable composition for a property, derived from its web address. The same property always
 * gets the same design (home carousel and its own page), and the current six are all different.
 */
export function heroVariant(slug: string) {
  let h = 2166136261 ^ 15;
  for (const ch of slug) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h % LAYOUTS.length;
}

/**
 * `heightClass` sets the `--h` custom property (the stack's height). Width follows
 * the height so the arches keep their proportions on short screens.
 */
export function ArchStack({
  images,
  variant = 0,
  heightClass = DEFAULT_HEIGHT,
}: {
  images: Property["heroImages"];
  /** Which composition to use; pass `heroVariant(property.slug)`. */
  variant?: number;
  heightClass?: string;
}) {
  const layout = LAYOUTS[variant % LAYOUTS.length];
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18 });
  const sy = useSpring(py, { stiffness: 90, damping: 18 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const innerX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const innerY = useTransform(sy, [-0.5, 0.5], [18, -18]);
  const backX = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const frontX = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const glareX = useTransform(sx, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(sy, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, hsl(40 100% 98% / 0.35), transparent 55%)`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease, delay: 0.2 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      // Full width of its column, capped at its height: on a phone it never pushes the page wider.
      className={`perspective-1000 relative mx-auto h-[var(--h)] w-full max-w-[calc(var(--h)*1)] touch-pan-y ${heightClass}`}
    >
      <motion.div style={{ rotateX, rotateY }} className="preserve-3d absolute inset-0">
        {/* back layer, deepest */}
        <motion.div
          style={{ x: backX, z: 0 }}
          className={`absolute overflow-hidden shadow-2xl ${layout.back}`}
        >
          <Image
            src={images.back.src}
            alt={images.back.alt}
            width={960}
            height={1280}
            priority
            quality={85}
            sizes="(min-width: 640px) 640px, 480px"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* main layer */}
        {/* Layers are inset because perspective scales nearer ones up; this keeps every edge inside the stack. */}
        <motion.div
          style={{ z: 0 }}
          className={`absolute overflow-hidden shadow-[0_40px_100px_-30px_hsl(var(--foreground)/0.5)] ${layout.main}`}
        >
          <>
            <motion.div style={{ x: innerX, y: innerY }} className="absolute -inset-5">
              <Image
                src={images.main.src}
                alt={images.main.alt}
                width={960}
                height={1280}
                priority
                quality={85}
                sizes="(min-width: 640px) 900px, 700px"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div
              style={{ backgroundImage: glare }}
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            />
          </>
        </motion.div>

        {/* front layer, closest */}
        <motion.div
          style={{ x: frontX, z: 0 }}
          className={`absolute overflow-hidden shadow-2xl ${layout.front}`}
        >
          <Image
            src={images.front.src}
            alt={images.front.alt}
            width={960}
            height={1280}
            priority
            quality={85}
            sizes="(min-width: 640px) 560px, 420px"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
