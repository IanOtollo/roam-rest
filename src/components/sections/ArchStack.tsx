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
const DEFAULT_HEIGHT = "[--h:min(34rem,calc(100svh-8rem))]";

/**
 * `heightClass` sets the `--h` custom property (the stack's height). Width follows
 * the height so the arches keep their proportions on short screens.
 */
export function ArchStack({
  images,
  heightClass = DEFAULT_HEIGHT,
}: {
  images: Property["heroImages"];
  heightClass?: string;
}) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18 });
  const sy = useSpring(py, { stiffness: 90, damping: 18 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const innerX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const innerY = useTransform(sy, [-0.5, 0.5], [18, -18]);
  const backX = useTransform(sx, [-0.5, 0.5], [-34, 34]);
  const frontX = useTransform(sx, [-0.5, 0.5], [40, -40]);
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
      // Full width of its column, capped at 0.9 x height: on a phone it never pushes the page wider.
      className={`perspective-1000 relative mx-auto h-[var(--h)] w-full max-w-[calc(var(--h)*0.9)] touch-pan-y ${heightClass}`}
    >
      <motion.div style={{ rotateX, rotateY }} className="preserve-3d absolute inset-0">
        {/* back layer, deepest */}
        <motion.div
          style={{ x: backX, z: -140 }}
          className="absolute left-[2%] top-[12%] h-[50%] w-[32%] overflow-hidden rounded-t-full shadow-2xl"
        >
          <Image
            src={images.back.src}
            alt={images.back.alt}
            width={960}
            height={1280}
            priority
            sizes="208px"
            className="h-full w-full scale-125 object-cover"
          />
        </motion.div>

        {/* main layer */}
        {/* Layers are inset because perspective scales nearer ones up; this keeps every edge inside the stack. */}
        <div className="preserve-3d absolute inset-x-0 top-[5%] flex h-[88%] justify-center">
          <motion.div
            style={{ z: 40 }}
            className="relative h-full w-[66%] overflow-hidden rounded-t-full shadow-[0_40px_100px_-30px_hsl(var(--foreground)/0.5)]"
          >
            <motion.div style={{ x: innerX, y: innerY }} className="absolute -inset-8">
              <Image
                src={images.main.src}
                alt={images.main.alt}
                width={960}
                height={1280}
                priority
                sizes="(min-width: 640px) 384px, 288px"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div
              style={{ backgroundImage: glare }}
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            />
          </motion.div>
        </div>

        {/* front layer, closest */}
        <motion.div
          style={{ x: frontX, z: 150 }}
          className="absolute bottom-[10%] right-[4%] h-[40%] w-[28%] overflow-hidden rounded-t-full shadow-2xl"
        >
          <Image
            src={images.front.src}
            alt={images.front.alt}
            width={960}
            height={1280}
            priority
            sizes="176px"
            className="h-full w-full scale-125 object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
