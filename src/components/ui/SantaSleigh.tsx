"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/*
  Santa, his sleigh and four reindeer, drawn as a detailed vector illustration. Facing right. The viewBox
  starts at a negative x so the sparkle trail behind the sleigh is part of the picture.
*/

function Reindeer({ x, lead, delay }: { x: number; lead?: boolean; delay: string }) {
  const coat = "#8a5a34";
  const dark = "#5e3b1f";
  return (
    <g transform={`translate(${x} 96)`}>
      {/* far legs (behind the body) */}
      <g className="deer-leg deer-leg-b" style={{ animationDelay: delay }}>
        <path d="M-15 8 L-18 24 L-13 38" stroke={dark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <g className="deer-leg" style={{ animationDelay: delay }}>
        <path d="M17 8 L19 24 L24 38" stroke={dark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* tail */}
      <ellipse cx="-27" cy="-5" rx="4.5" ry="3.2" fill="#f4efe6" />
      {/* body and chest */}
      <ellipse cx="0" cy="0" rx="27" ry="13" fill={coat} />
      <ellipse cx="14" cy="4" rx="12" ry="9" fill="#d9c3a0" opacity="0.55" />
      {/* neck and head */}
      <path d="M16 -6 Q28 -10 33 -24 L45 -20 Q40 -4 24 6 Z" fill={coat} />
      <ellipse cx="42" cy="-25" rx="11.5" ry="7.6" transform="rotate(24 42 -25)" fill={coat} />
      <ellipse cx="50" cy="-21" rx="6" ry="4.6" transform="rotate(24 50 -21)" fill="#d9c3a0" />
      {/* ear, eye */}
      <path d="M36 -30 L30 -38 L41 -33 Z" fill={dark} />
      <circle cx="44" cy="-28" r="1.5" fill="#1d1208" />
      {/* nose */}
      {lead ? (
        <>
          <circle cx="55.5" cy="-20" r="9" fill="#ff3b30" opacity="0.28" className="festive-twinkle" />
          <circle cx="55.5" cy="-20" r="3.6" fill="#ff2d20" className="festive-twinkle" />
        </>
      ) : (
        <circle cx="55.5" cy="-20" r="2.6" fill="#2a1a10" />
      )}
      {/* antlers */}
      <g stroke="#6b4a2a" strokeWidth="2.3" strokeLinecap="round" fill="none">
        <path d="M39 -31 Q34 -44 42 -54 M37 -39 Q46 -42 50 -50 M41 -49 Q34 -52 31 -60" />
        <path d="M44 -31 Q46 -44 54 -50 M49 -42 Q57 -42 60 -48" opacity="0.8" />
      </g>
      {/* harness */}
      <path d="M13 -12 Q19 0 13 12" stroke="#c8312b" strokeWidth="3.4" fill="none" />
      <path d="M24 -8 L30 -14" stroke="#c8312b" strokeWidth="2.4" />
      <circle cx="17" cy="9" r="2.4" fill="#e2b43a" />
      {/* near legs (in front of the body) */}
      <g className="deer-leg" style={{ animationDelay: delay }}>
        <path d="M-17 8 L-19 24 L-14 38" stroke={coat} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-14 38 L-10 41" stroke="#2a1a10" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="deer-leg deer-leg-b" style={{ animationDelay: delay }}>
        <path d="M19 8 L22 24 L27 38" stroke={coat} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M27 38 L31 41" stroke="#2a1a10" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Art() {
  return (
    <svg viewBox="-150 -20 800 215" className="block h-auto w-full overflow-visible" aria-hidden="true">
      {/* magic trail */}
      {[
        [-20, 112, 7],
        [-52, 100, 5],
        [-84, 122, 6],
        [-116, 106, 4],
        [-138, 128, 5],
        [-36, 136, 4],
        [-70, 84, 4],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          className="festive-twinkle"
          style={{ animationDelay: `${i * 0.3}s` }}
          d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`}
          fill="#f2d472"
        />
      ))}

      {/* reins and traces to the reindeer */}
      <path d="M214 92 L335 94 L413 96 L491 96 L569 96" stroke="#e2b43a" strokeWidth="1.8" fill="none" />
      <path d="M232 112 L330 104 L408 104 L486 104 L564 104" stroke="#c8312b" strokeWidth="1.6" fill="none" opacity="0.9" />

      {/* sleigh: runner, supports, body, back */}
      <path d="M14 152 L222 152 Q256 152 258 128 Q260 112 244 112" stroke="#e2b43a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M66 150 L70 120 M150 150 L152 122 M204 150 L206 130" stroke="#e2b43a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M40 148 L40 118 Q40 104 56 104 L196 104 Q214 104 228 90 L240 96 Q236 130 216 140 L208 148 Z" fill="#b8231d" />
      <path d="M40 118 Q18 100 26 72 Q42 78 56 104 Z" fill="#a31d18" />
      <path d="M44 126 L226 126" stroke="#e2b43a" strokeWidth="3" />
      <path d="M62 112 Q120 118 200 112" stroke="#f4d38a" strokeWidth="1.6" fill="none" opacity="0.85" />

      {/* sack and presents */}
      <path d="M44 102 Q14 58 66 58 Q112 62 102 104 Z" fill="#8b5e3c" />
      <path d="M56 70 Q66 62 80 66" stroke="#c9a06a" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M58 62 Q70 54 82 60 Q76 68 64 68 Z" fill="#c8312b" />
      <rect x="108" y="86" width="28" height="19" rx="2" fill="#2f7d4f" />
      <path d="M122 86 V105 M108 95 H136" stroke="#e2b43a" strokeWidth="3" />
      <rect x="138" y="90" width="22" height="15" rx="2" fill="#4f8fe0" />
      <path d="M149 90 V105 M138 97 H160" stroke="#f2d472" strokeWidth="2.6" />

      {/* Santa */}
      <path d="M130 104 Q130 64 160 60 Q190 64 190 104 Z" fill="#d0312b" />
      <path d="M130 100 H190" stroke="#1d1d22" strokeWidth="6" />
      <rect x="153" y="95" width="14" height="10" rx="1.5" fill="#e2b43a" />
      <path d="M160 60 V104" stroke="#f4efe6" strokeWidth="5" opacity="0.95" />
      {/* arm to the reins */}
      <path d="M176 72 Q198 74 212 90" stroke="#d0312b" strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M176 72 Q198 74 212 90" stroke="#f4efe6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" strokeDasharray="1 7" />
      <circle cx="215" cy="92" r="6" fill="#1d1d22" />
      {/* head */}
      <circle cx="162" cy="46" r="14" fill="#f2c9a5" />
      <circle cx="155" cy="49" r="3" fill="#e9967f" opacity="0.6" />
      <circle cx="169" cy="49" r="3" fill="#e9967f" opacity="0.6" />
      <circle cx="157" cy="44" r="1.7" fill="#2a1a10" />
      <circle cx="167" cy="44" r="1.7" fill="#2a1a10" />
      <ellipse cx="162" cy="50" rx="3" ry="2.2" fill="#e8a98a" />
      {/* beard and moustache */}
      <path d="M148 50 Q148 76 162 80 Q176 76 176 50 Q170 60 162 58 Q154 60 148 50 Z" fill="#fbf8f2" />
      <path d="M154 54 Q158 49 162 54 Q166 49 170 54 Q166 58 162 56 Q158 58 154 54 Z" fill="#fbf8f2" />
      {/* hat */}
      <path d="M147 40 Q150 14 176 18 Q192 20 194 36 Q180 26 168 30 Q158 33 177 41 Z" fill="#d0312b" />
      <rect x="146" y="36" width="34" height="9" rx="4.5" fill="#fbf8f2" />
      <circle cx="195" cy="38" r="6" fill="#fbf8f2" />

      {/* reindeer, lead (with the glowing nose) at the front */}
      <Reindeer x={335} delay="-0.1s" />
      <Reindeer x={413} delay="-0.3s" />
      <Reindeer x={491} delay="-0.05s" />
      <Reindeer x={569} lead delay="-0.4s" />
    </svg>
  );
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Every so often Santa's sleigh glides across the page, left to right and then back again, bobbing a
 * little as the reindeer gallop. It never blocks a tap, and is skipped for reduced motion.
 */
export function SantaSleigh() {
  const reduce = useReducedMotion();
  const [flight, setFlight] = useState<{ id: number; dir: 1 | -1; top: number } | null>(null);
  const count = useRef(0);
  const timer = useRef<number>();

  useEffect(() => {
    if (reduce) return;
    const launch = () => {
      count.current += 1;
      setFlight({ id: count.current, dir: count.current % 2 === 1 ? 1 : -1, top: rand(12, 34) });
    };
    timer.current = window.setTimeout(launch, 5000); // first pass shortly after the page opens
    return () => window.clearTimeout(timer.current);
  }, [reduce]);

  if (reduce || !flight) return null;

  const width = typeof window !== "undefined" ? Math.min(640, Math.max(300, window.innerWidth * 0.55)) : 480;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const from = flight.dir === 1 ? -width - 40 : vw + 40;
  const to = flight.dir === 1 ? vw + 40 : -width - 40;

  return (
    <motion.div
      key={flight.id}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 z-[43]"
      style={{ top: `${flight.top}vh`, width }}
      initial={{ x: from, y: 0, rotate: 0 }}
      animate={{ x: to, y: [0, -22, 8, -16, 0], rotate: [0, -2.2, 1.6, -1.8, 0] }}
      transition={{
        x: { duration: 18, ease: "linear" },
        y: { duration: 18, ease: "easeInOut" },
        rotate: { duration: 18, ease: "easeInOut" },
      }}
      onAnimationComplete={() => {
        setFlight(null);
        timer.current = window.setTimeout(() => {
          count.current += 1;
          setFlight({ id: count.current, dir: count.current % 2 === 1 ? 1 : -1, top: rand(12, 34) });
        }, rand(30000, 45000));
      }}
    >
      <div style={flight.dir === -1 ? { transform: "scaleX(-1)" } : undefined}>
        <Art />
      </div>
    </motion.div>
  );
}
