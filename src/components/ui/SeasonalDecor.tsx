"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useFestive } from "@/components/ui/SeasonalEffect";
import { SantaSleigh } from "@/components/ui/SantaSleigh";
import type { Season } from "@/lib/season";

/*
  Hand-drawn seasonal decorations that hang from the top of the page, below the navigation bar.
  They never block a tap (pointer-events: none), sit under pop-ups, and are kept light on phones.
  The falling effects (snow, bats, confetti) live in SeasonalEffect.tsx.
*/

const NAV = "top-[4.06rem]"; // just under the 4rem navigation bar and its 1px border

/** A swag: a wire hanging in scallops across the page. Returns the SVG path and the points along it. */
const SWAGS = 7;
const SW = 1000 / SWAGS;
const DEPTH = 30; // the control point; the wire dips half of this
const swagPath = Array.from({ length: SWAGS }, (_, i) => `M${i * SW},0 Q${i * SW + SW / 2},${DEPTH} ${(i + 1) * SW},0`).join(" ");
function swagPoints(per: number) {
  const pts: { x: number; y: number; n: number }[] = [];
  let n = 0;
  for (let i = 0; i < SWAGS; i++)
    for (let k = 1; k <= per; k++) {
      const t = k / (per + 1);
      pts.push({ x: i * SW + t * SW, y: 2 * (1 - t) * t * DEPTH, n: n++ });
    }
  return pts;
}

function Swag({ per, children }: { per: number; children: (p: { x: number; y: number; n: number }) => React.ReactNode }) {
  return (
    <div className={`pointer-events-none fixed inset-x-0 ${NAV} z-[44] h-12`} aria-hidden="true">
      <svg viewBox={`0 0 1000 ${DEPTH / 2 + 2}`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[16px] w-full overflow-visible">
        <path d={swagPath} fill="none" className="stroke-foreground/40" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      {swagPoints(per).map((p) => children(p))}
    </div>
  );
}

/* ---------------------------------------------------------------- CHRISTMAS */

const BULBS = ["#e0453a", "#f2c94c", "#3fae6a", "#4f8fe0", "#e86fa0"];

function ChristmasLights() {
  return (
    <Swag per={3}>
      {(p) => {
        const c = BULBS[p.n % BULBS.length];
        return (
          <span
            key={p.n}
            className={`absolute ${p.n % 2 ? "hidden sm:block" : ""}`}
            style={{ left: `${p.x / 10}%`, top: `${p.y * 0.5}px` }}
          >
            <span className="relative -ml-[5px] block">
              <span className="absolute left-1/2 top-0 h-[5px] w-[6px] -translate-x-1/2 rounded-sm bg-foreground/50" />
              <span
                className="festive-twinkle mt-[4px] block h-[13px] w-[10px] rounded-b-full rounded-t-[40%]"
                style={{ background: c, boxShadow: `0 0 10px 2px ${c}99`, animationDelay: `${(p.n % 7) * 0.35}s` }}
              />
            </span>
          </span>
        );
      }}
    </Swag>
  );
}

function Bauble({ left, drop, hue, delay }: { left: string; drop: number; hue: [string, string]; delay: string }) {
  return (
    <div className={`festive-swing fixed ${NAV} z-[44] hidden sm:block`} style={{ right: left, animationDelay: delay }} aria-hidden="true">
      <span className="mx-auto block w-px bg-foreground/40" style={{ height: drop }} />
      <svg width="34" height="40" viewBox="0 0 34 40" className="-mt-px block">
        <rect x="13" y="0" width="8" height="6" rx="1.5" fill="#caa24a" />
        <circle cx="17" cy="23" r="15" fill={`url(#bg-${hue[0].slice(1)})`} />
        <defs>
          <radialGradient id={`bg-${hue[0].slice(1)}`} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.25" stopColor={hue[0]} />
            <stop offset="1" stopColor={hue[1]} />
          </radialGradient>
        </defs>
        <path d="M6 22 Q17 28 28 22" stroke="#f2e2a8" strokeWidth="1.6" fill="none" opacity="0.8" />
      </svg>
    </div>
  );
}

function Holly() {
  return (
    <svg
      viewBox="0 0 120 70"
      className={`pointer-events-none fixed left-1 ${NAV} z-[44] hidden h-[62px] w-[105px] sm:block`}
      aria-hidden="true"
    >
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M60 6 C${60 + s * 18} -6 ${60 + s * 46} 4 ${60 + s * 50} 26 C${60 + s * 28} 28 ${60 + s * 10} 22 60 6 Z`}
          fill="#2f7d4f"
          stroke="#235f3b"
          strokeWidth="1.2"
        />
      ))}
      <path d="M60 6 C74 16 92 22 108 26 M60 6 C46 16 28 22 12 26" stroke="#235f3b" strokeWidth="1" fill="none" opacity="0.7" />
      {[
        [54, 16],
        [66, 18],
        [60, 26],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.2" fill="#c8312b" />
          <circle cx={x - 1.6} cy={y - 1.8} r="1.4" fill="#ffd9d4" opacity="0.9" />
        </g>
      ))}
      <path d="M52 8 L42 -2 M68 8 L78 -2" stroke="#8a6a3b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- HALLOWEEN */

const PENNANT = ["#f08a24", "#6b3fa0", "#1c1c24"];

function Bunting() {
  return (
    <Swag per={4}>
      {(p) => (
        <span
          key={p.n}
          className={`absolute ${p.n % 2 ? "hidden sm:block" : ""}`}
          style={{ left: `${p.x / 10}%`, top: `${p.y * 0.5}px`, transform: "translateX(-50%)" }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26" className="block">
            <path d="M0 0 H22 L11 26 Z" fill={PENNANT[p.n % PENNANT.length]} />
            {p.n % 3 === 0 && <path d="M7 6 l2 3 l2 -3 l2 3 l2 -3 v4 h-8 z" fill="#ffd9a0" opacity="0.9" />}
            {p.n % 3 === 1 && <circle cx="11" cy="8" r="2.2" fill="#f4b45a" opacity="0.9" />}
          </svg>
        </span>
      )}
    </Swag>
  );
}

function Cobweb({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`pointer-events-none fixed ${NAV} z-[44] h-[100px] w-[100px] sm:h-[170px] sm:w-[170px] ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
      aria-hidden="true"
    >
      <g className="stroke-foreground/45" fill="none" strokeWidth="0.9" strokeLinecap="round">
        <path d="M0 0 L118 0 M0 0 L0 118 M0 0 L104 62 M0 0 L62 104 M0 0 L84 20 M0 0 L20 84" />
        <path d="M22 0 Q18 16 0 22 M44 0 Q38 30 0 44 M68 0 Q58 44 0 68 M94 0 Q80 62 0 94" />
      </g>
      <g transform="translate(66 62)">
        <circle r="3" className="fill-foreground/70" />
        <circle cx="0" cy="-4.5" r="2" className="fill-foreground/70" />
        <path d="M-2 -1 L-9 -6 M-2 1 L-10 2 M-2 3 L-8 9 M2 -1 L9 -6 M2 1 L10 2 M2 3 L8 9" className="stroke-foreground/70" strokeWidth="0.9" fill="none" />
      </g>
    </svg>
  );
}

function Spider({ left, drop, delay }: { left: string; drop: number; delay: string }) {
  return (
    <div className={`festive-dangle fixed ${NAV} z-[44] hidden sm:block`} style={{ left, animationDelay: delay }} aria-hidden="true">
      <span className="mx-auto block w-px bg-foreground/45" style={{ height: drop }} />
      <svg width="30" height="26" viewBox="-15 -4 30 26" className="-mt-px block">
        <g className="stroke-foreground/80" strokeWidth="1.3" fill="none" strokeLinecap="round">
          <path d="M-4 8 L-12 3 L-14 12 M-4 11 L-13 12 L-13 19 M4 8 L12 3 L14 12 M4 11 L13 12 L13 19" />
        </g>
        <ellipse cx="0" cy="12" rx="6.5" ry="7.5" className="fill-foreground/85" />
        <circle cx="0" cy="4" r="3.6" className="fill-foreground/85" />
        <circle cx="-1.4" cy="3.6" r="0.9" fill="#f08a24" />
        <circle cx="1.4" cy="3.6" r="0.9" fill="#f08a24" />
      </svg>
    </div>
  );
}

/* ----------------------------------------------------------------- NEW YEAR */

function Star({ n, x, y }: { n: number; x: number; y: number }) {
  const gold = n % 2 === 0;
  return (
    <span
      key={n}
      className={`absolute ${n % 2 ? "hidden sm:block" : ""}`}
      style={{ left: `${x / 10}%`, top: `${y * 0.5}px`, transform: "translateX(-50%)" }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" className="festive-twinkle block" style={{ animationDelay: `${(n % 6) * 0.4}s` }}>
        <path
          d="M10 0 L12.4 7 L20 7.2 L14 11.8 L16.2 19.4 L10 14.9 L3.8 19.4 L6 11.8 L0 7.2 L7.6 7 Z"
          fill={gold ? "#e2b43a" : "#cfd3dc"}
          stroke={gold ? "#b98a14" : "#9aa0ad"}
          strokeWidth="0.8"
        />
      </svg>
    </span>
  );
}

function StarGarland() {
  return <Swag per={3}>{(p) => <Star key={p.n} n={p.n} x={p.x} y={p.y} />}</Swag>;
}

function Streamer({ side }: { side: "left" | "right" }) {
  const hues = ["#e2b43a", "#e0869a", "#9db8e8"];
  return (
    <svg
      viewBox="0 0 90 200"
      className={`festive-sway pointer-events-none fixed ${NAV} z-[44] hidden h-[170px] w-[76px] sm:block ${side === "left" ? "left-2" : "right-2 -scale-x-100"}`}
      aria-hidden="true"
    >
      {hues.map((c, i) => (
        <path
          key={c}
          d={`M${14 + i * 22} 0 C${-6 + i * 26} 40 ${40 + i * 14} 62 ${18 + i * 24} 100 S${52 + i * 10} 150 ${26 + i * 22} ${186 - i * 14}`}
          stroke={c}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.92"
        />
      ))}
    </svg>
  );
}


/* ------------------------------------------------------------------- DIWALI */

const MARIGOLD = ["#f5a623", "#f08a24", "#ffc83d"];

function MarigoldGarland() {
  return (
    <Swag per={4}>
      {(p) => {
        const c = MARIGOLD[p.n % MARIGOLD.length];
        return (
          <span
            key={p.n}
            className={`absolute ${p.n % 2 ? "hidden sm:block" : ""}`}
            style={{ left: `${p.x / 10}%`, top: `${p.y * 0.5}px`, transform: "translateX(-50%)" }}
          >
            <svg width="22" height="24" viewBox="0 0 22 24" className="block">
              <path d="M11 13 Q4 17 6 23 Q12 21 11 13 Z" fill="#3f8f4f" opacity="0.9" />
              {Array.from({ length: 9 }, (_, i) => {
                const a = (i / 9) * Math.PI * 2;
                return <circle key={i} cx={11 + Math.cos(a) * 5.2} cy={9 + Math.sin(a) * 5.2} r="3.4" fill={c} />;
              })}
              <circle cx="11" cy="9" r="4" fill="#d9731a" />
              <circle cx="11" cy="9" r="2" fill="#ffd166" />
            </svg>
          </span>
        );
      }}
    </Swag>
  );
}

function Lantern({ left, right, drop, hue, delay }: { left?: string; right?: string; drop: number; hue: [string, string]; delay: string }) {
  const id = `ln-${hue[0].slice(1)}`;
  return (
    <div className={`festive-swing fixed ${NAV} z-[44] hidden sm:block`} style={{ left, right, animationDelay: delay }} aria-hidden="true">
      <span className="mx-auto block w-px bg-foreground/40" style={{ height: drop }} />
      <svg width="40" height="74" viewBox="0 0 40 74" className="-mt-px block">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hue[0]} />
            <stop offset="1" stopColor={hue[1]} />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff2b0" stopOpacity="0.95" />
            <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M14 0 H26 L24 7 H16 Z" fill="#caa24a" />
        <path d="M10 9 H30 L36 28 Q38 44 30 56 H10 Q2 44 4 28 Z" fill={`url(#${id})`} stroke="#caa24a" strokeWidth="1.4" />
        <ellipse cx="20" cy="33" rx="13" ry="16" fill={`url(#${id}-glow)`} className="festive-twinkle" />
        <path d="M13 12 Q8 34 12 54 M27 12 Q32 34 28 54 M20 9 V56" stroke="#caa24a" strokeWidth="1" fill="none" opacity="0.8" />
        <path d="M10 56 H30 L27 62 H13 Z" fill="#caa24a" />
        <path d="M16 62 V72 M20 62 V74 M24 62 V72" stroke="#e0869a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Diya({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="-6" rx="13" ry="12" fill="#ffb347" opacity="0.28" className="festive-twinkle" style={{ animationDelay: delay }} />
      <path d="M0 -22 Q7 -12 3.4 -5 Q0 -2 -3.4 -5 Q-7 -12 0 -22 Z" fill="#ffd54f" className="festive-twinkle" style={{ animationDelay: delay }} />
      <path d="M0 -17 Q3 -11 1.6 -7 Q0 -5 -1.6 -7 Q-3 -11 0 -17 Z" fill="#ff8a1f" />
      <path d="M-15 -3 Q-14 8 0 9 Q14 8 15 -3 Q0 1 -15 -3 Z" fill="#b5532a" stroke="#8a3a1a" strokeWidth="1" />
      <path d="M-15 -3 Q0 1 15 -3" stroke="#e2b43a" strokeWidth="1.4" fill="none" />
    </g>
  );
}

/** A small rangoli with three lit diyas, in the bottom-left corner. */
function Rangoli() {
  const ring = (r: number, n: number, c: string, rx: number, ry: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return (
        <ellipse
          key={`${r}-${i}`}
          cx={Math.cos(a) * r}
          cy={Math.sin(a) * r}
          rx={rx}
          ry={ry}
          transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r} ${Math.sin(a) * r})`}
          fill={c}
          opacity="0.92"
        />
      );
    });
  return (
    <svg viewBox="-70 -62 140 110" className="pointer-events-none fixed bottom-2 left-2 z-[44] hidden h-[110px] w-[140px] sm:block" aria-hidden="true">
      <g transform="translate(0 4) scale(1 0.55)">
        {ring(46, 16, "#e0549b", 9, 4.2)}
        {ring(34, 12, "#f5a623", 8, 3.8)}
        {ring(22, 10, "#fff4d6", 7, 3.4)}
        {ring(11, 8, "#e0549b", 5, 2.6)}
        <circle r="5" fill="#f5a623" />
      </g>
      <Diya x={-38} y={4} delay="0s" />
      <Diya x={0} y={14} delay="-0.8s" />
      <Diya x={38} y={4} delay="-1.6s" />
    </svg>
  );
}

/* ----------------------------------------------------------------- GREETING */

const GREETING: Record<Season, (year: number) => string> = {
  christmas: () => "Merry Christmas from Roam & Rest",
  halloween: () => "Happy Halloween from Roam & Rest",
  diwali: () => "Happy Diwali from Roam & Rest",
  newyear: (y) => `Happy New Year ${y}`,
};

function Greeting({ season }: { season: Season }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("rr_festive_greeted") === season;
    } catch {
      /* show it; it fades by itself */
    }
    if (seen) return;
    setShow(true);
    try {
      sessionStorage.setItem("rr_festive_greeted", season);
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setShow(false), 7000);
    return () => window.clearTimeout(t);
  }, [season]);

  const now = new Date();
  const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  return (
    <AnimatePresence>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed inset-x-0 top-[6.2rem] z-[46] mx-auto w-fit max-w-[90vw] rounded-full border border-border bg-card/90 px-5 py-2 text-center font-serif text-sm tracking-tight shadow-lg backdrop-blur-sm sm:text-base"
          aria-live="polite"
        >
          {GREETING[season](year)}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** The decorations for whichever season is on. Hidden on the admin screens. */
export function SeasonalDecor() {
  const { season, on } = useFestive();
  const path = usePathname() ?? "/";
  if (!season || !on || path.startsWith("/admin")) return null;

  return (
    <>
      {season === "christmas" && (
        <>
          <ChristmasLights />
          <Holly />
          <Bauble left="2.5%" drop={44} hue={["#e0453a", "#8f1d18"]} delay="0s" />
          <Bauble left="6.5%" drop={74} hue={["#e2b43a", "#9a7413"]} delay="-1.6s" />
          <Bauble left="10%" drop={52} hue={["#4f8fe0", "#244f8f"]} delay="-3s" />
          <SantaSleigh />
        </>
      )}
      {season === "halloween" && (
        <>
          <Bunting />
          <Cobweb side="left" />
          <Cobweb side="right" />
          <Spider left="13%" drop={64} delay="0s" />
          <Spider left="84%" drop={92} delay="-2.2s" />
        </>
      )}
      {season === "diwali" && (
        <>
          <MarigoldGarland />
          <Lantern left="1%" drop={2} hue={["#e0549b", "#8f1d5a"]} delay="0s" />
          <Lantern left="4.5%" drop={14} hue={["#f5a623", "#b5551a"]} delay="-1.8s" />
          <Lantern right="3%" drop={56} hue={["#2fb3a8", "#14665f"]} delay="-3.2s" />
          <Lantern right="8%" drop={84} hue={["#e0549b", "#8f1d5a"]} delay="-0.9s" />
          <Rangoli />
        </>
      )}
      {season === "newyear" && (
        <>
          <StarGarland />
          <Streamer side="left" />
          <Streamer side="right" />
        </>
      )}
      <Greeting season={season} />
    </>
  );
}
