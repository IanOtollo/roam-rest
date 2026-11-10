"use client";

import { useEffect, useRef, useState } from "react";
import { FESTIVE_EVENT, festiveEnabled, seasonFromUrl, seasonFor, setFestiveEnabled, type Season } from "@/lib/season";

/** The season in force right now, and whether this visitor has the effects switched on. */
export function useFestive() {
  const [season, setSeason] = useState<Season | null>(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const read = () => {
      const forced = seasonFromUrl(window.location.search);
      setSeason(forced === undefined ? seasonFor() : forced);
      setOn(festiveEnabled());
    };
    read();
    window.addEventListener(FESTIVE_EVENT, read);
    return () => window.removeEventListener(FESTIVE_EVENT, read);
  }, []);

  return { season, on, setOn: setFestiveEnabled };
}

/* ------------------------------------------------------------------ drawing */

interface Flake { x: number; y: number; r: number; vy: number; phase: number; gold: boolean }
interface Ember { x: number; y: number; r: number; vy: number; life: number; max: number }
interface Bat { x: number; y: number; dir: 1 | -1; speed: number; size: number; phase: number; wob: number }
interface Confetti { x: number; y: number; w: number; h: number; vy: number; vx: number; rot: number; vr: number; color: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const CONFETTI = ["#d4a017", "#c0c0c8", "#e0556b", "#4f8fe0", "#f2c94c", "#7bc47f"];
const BURST = ["#f2c94c", "#ff7a90", "#7fb2ff", "#ffffff", "#9be3a0"];
const DIWALI_BURST = ["#ffb347", "#ff7043", "#ffd54f", "#ff5fa2", "#fff3c4"];

function drawBat(ctx: CanvasRenderingContext2D, b: Bat, t: number, fill: string) {
  const flap = Math.sin(t * 0.012 + b.phase); // -1..1
  const s = b.size;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(b.dir, 1);
  ctx.fillStyle = fill;
  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.18, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // wings, flapping
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.1);
    ctx.quadraticCurveTo(side * s * 0.6, -s * (0.5 + flap * 0.35), side * s, -s * 0.05 + flap * s * 0.25);
    ctx.quadraticCurveTo(side * s * 0.7, s * 0.05, side * s * 0.45, s * 0.12);
    ctx.quadraticCurveTo(side * s * 0.25, s * 0.02, 0, s * 0.15);
    ctx.closePath();
    ctx.fill();
  }
  // ears
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.25);
  ctx.lineTo(-s * 0.06, -s * 0.42);
  ctx.lineTo(0, -s * 0.28);
  ctx.lineTo(s * 0.06, -s * 0.42);
  ctx.lineTo(s * 0.1, -s * 0.25);
  ctx.fill();
  ctx.restore();
}

/**
 * Light falling-and-floating effects for Halloween (bats and embers), Christmas (snow) and New Year
 * (confetti and fireworks). It never blocks a tap, stops when the tab is hidden, is lighter on
 * phones, and is skipped entirely for visitors who prefer reduced motion or have switched it off.
 */
export function SeasonalEffect() {
  const { season, on } = useFestive();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !season || !on) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const c: CanvasRenderingContext2D = ctx;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dark = () => document.documentElement.classList.contains("dark");
    const count = (per: number, cap: number) => Math.min(cap, Math.round((w * h) / per));

    const flakes: Flake[] = [];
    const embers: Ember[] = [];
    const bats: Bat[] = [];
    const confetti: Confetti[] = [];
    const sparks: Spark[] = [];

    if (season === "christmas") {
      for (let i = 0; i < count(14000, 90); i++)
        flakes.push({ x: rand(0, w), y: rand(0, h), r: rand(1.4, 3.6), vy: rand(0.35, 1.1), phase: rand(0, 6.28), gold: Math.random() < 0.12 });
    }
    if (season === "halloween") {
      for (let i = 0; i < count(26000, 40); i++)
        embers.push({ x: rand(0, w), y: rand(0, h), r: rand(1.2, 3), vy: rand(0.2, 0.7), life: rand(0, 1), max: rand(180, 360) });
    }
    if (season === "diwali") {
      for (let i = 0; i < count(30000, 30); i++)
        embers.push({ x: rand(0, w), y: rand(0, h), r: rand(3, 6.5), vy: rand(0.25, 0.6), life: rand(0, 1), max: rand(320, 560) });
    }
    if (season === "newyear") {
      for (let i = 0; i < count(15000, 80); i++)
        confetti.push({ x: rand(0, w), y: rand(-h, h), w: rand(5, 9), h: rand(8, 14), vy: rand(0.6, 1.6), vx: rand(-0.4, 0.4), rot: rand(0, 6.28), vr: rand(-0.05, 0.05), color: CONFETTI[Math.floor(rand(0, CONFETTI.length))] });
    }

    let raf = 0;
    let last = 0;
    let nextBat = 600;
    let nextBurst = 1200;
    let running = true;

    const frame = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (t - last < 33) return; // about 30 frames a second is plenty and keeps phones cool
      const dt = Math.min((t - last) / 16.7, 3);
      last = t;
      c.clearRect(0, 0, w, h);

      if (season === "christmas") {
        const fill = dark() ? "rgba(255,255,255,0.85)" : "rgba(120,150,190,0.7)";
        for (const f of flakes) {
          f.y += f.vy * dt;
          f.phase += 0.012 * dt;
          f.x += Math.sin(f.phase) * 0.45 * dt;
          if (f.y > h + 6) { f.y = -6; f.x = rand(0, w); }
          if (f.x > w + 6) f.x = -6;
          if (f.x < -6) f.x = w + 6;
          c.beginPath();
          c.fillStyle = f.gold ? "rgba(212,160,23,0.85)" : fill;
          c.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          c.fill();
        }
      }

      if (season === "halloween") {
        for (const e of embers) {
          e.y -= e.vy * dt;
          e.life += dt;
          if (e.life > e.max || e.y < -6) { e.y = h + 6; e.x = rand(0, w); e.life = 0; }
          const a = Math.sin((e.life / e.max) * Math.PI);
          const g = c.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
          g.addColorStop(0, `rgba(255,150,40,${0.85 * a})`);
          g.addColorStop(1, "rgba(255,120,20,0)");
          c.fillStyle = g;
          c.beginPath();
          c.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
          c.fill();
        }
        if (t > nextBat && bats.length < 4) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          bats.push({ x: dir === 1 ? -40 : w + 40, y: rand(h * 0.08, h * 0.45), dir: dir as 1 | -1, speed: rand(1.4, 2.6), size: rand(28, 52), phase: rand(0, 6.28), wob: rand(0, 6.28) });
          nextBat = t + rand(1800, 4200);
        }
        const fill = dark() ? "rgba(190,150,255,0.92)" : "rgba(45,30,70,0.88)";
        for (let i = bats.length - 1; i >= 0; i--) {
          const b = bats[i];
          b.x += b.dir * b.speed * dt;
          b.wob += 0.04 * dt;
          b.y += Math.sin(b.wob) * 0.9 * dt;
          drawBat(c, b, t, fill);
          if (b.x < -80 || b.x > w + 80) bats.splice(i, 1);
        }
      }

      if (season === "diwali") {
        // Sky lanterns drifting up, each a small warm glow with a glowing paper body.
        for (const e of embers) {
          e.y -= e.vy * dt;
          e.x += Math.sin((e.life + e.y) * 0.01) * 0.25 * dt;
          e.life += dt;
          if (e.life > e.max || e.y < -20) { e.y = h + 20; e.x = rand(0, w); e.life = 0; }
          const a = Math.sin((e.life / e.max) * Math.PI);
          const g = c.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
          g.addColorStop(0, `rgba(255,190,70,${0.55 * a})`);
          g.addColorStop(1, "rgba(255,140,30,0)");
          c.fillStyle = g;
          c.beginPath();
          c.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = `rgba(255,214,120,${0.95 * a})`;
          c.beginPath();
          c.roundRect(e.x - e.r * 0.8, e.y - e.r * 1.1, e.r * 1.6, e.r * 2.2, e.r * 0.5);
          c.fill();
        }
      }

      if (season === "newyear" || season === "diwali") {
        for (const p of season === "newyear" ? confetti : []) {
          p.y += p.vy * dt;
          p.x += p.vx * dt + Math.sin(p.rot) * 0.3;
          p.rot += p.vr * dt;
          if (p.y > h + 14) { p.y = -14; p.x = rand(0, w); }
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.fillStyle = p.color;
          c.globalAlpha = 0.85;
          c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
          c.restore();
        }
        if (t > nextBurst) {
          const cx = rand(w * 0.15, w * 0.85);
          const cy = rand(h * 0.1, h * 0.4);
          const palette = season === "diwali" ? DIWALI_BURST : BURST;
          const color = palette[Math.floor(rand(0, palette.length))];
          for (let i = 0; i < 36; i++) {
            const a = (i / 36) * Math.PI * 2;
            const sp = rand(1.6, 3.4);
            sparks.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color });
          }
          nextBurst = t + rand(2600, 4200);
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vy += 0.035 * dt;
          s.vx *= 0.99;
          s.life -= 0.014 * dt;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          c.globalAlpha = s.life;
          c.fillStyle = s.color;
          c.beginPath();
          c.arc(s.x, s.y, 2, 0, Math.PI * 2);
          c.fill();
          c.globalAlpha = 1;
        }
      }
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) { last = 0; raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      c.clearRect(0, 0, el.width, el.height);
    };
  }, [season, on]);

  if (!season || !on) return null;
  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] h-full w-full" />;
}
