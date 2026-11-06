"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { ease } from "@/lib/utils";
import { brand } from "@/lib/property";
import { legalDocs } from "@/lib/legal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";

/**
 * Account / profile button in the navbar.
 * Guest accounts aren't live yet, so sign-in is shown as "coming soon" rather
 * than faked. The links below it work today. When auth is added, swap the
 * signed-out block for the signed-in state here.
 */
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = legalDocs.filter((d) => ["cancellation", "house-rules", "terms"].includes(d.slug));
  const itemClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted active:scale-[0.98]"
      >
        <User className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl"
          >
            <div className="px-3 pb-3 pt-2">
              <p className="font-serif text-lg tracking-tight">Your account</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to save stays and manage your trips.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground opacity-50"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-border px-4 py-2.5 text-sm opacity-50"
                >
                  Sign up
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                No account needed to book. Sign-in for saved stays is coming soon.
              </p>
            </div>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              role="switch"
              aria-checked={dark}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              className={`${itemClass} w-full justify-between sm:hidden`}
            >
              <span className="flex items-center gap-3">
                {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Dark mode
              </span>
              <span
                aria-hidden="true"
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${dark ? "bg-primary" : "bg-border"}`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-background transition-transform duration-300 ${dark ? "translate-x-4" : "translate-x-0"}`}
                />
              </span>
            </button>

            <a
              role="menuitem"
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
            >
              <WhatsAppIcon className="h-4 w-4" /> Chat with us on WhatsApp
            </a>
            {links.map((d) => (
              <Link key={d.slug} role="menuitem" href={`/legal/${d.slug}`} onClick={() => setOpen(false)} className={itemClass}>
                <span className="h-4 w-4" aria-hidden="true" /> {d.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
