"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ChevronRight, FileText, Heart, LogOut, Moon, Sparkles, Sun, User, UserRound } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { ease } from "@/lib/utils";
import { brand } from "@/lib/property";
import { legalDocs } from "@/lib/legal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { useAccount } from "@/components/account/AccountProvider";
import { useFestive } from "@/components/ui/SeasonalEffect";
import { SEASONS } from "@/lib/season";
import { signOutAction } from "@/app/account/actions";

const initials = (name: string | null) =>
  (name ?? "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "G";

/** A small uppercase label above a group of menu items. */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{children}</p>
);

/**
 * Account button in the navbar. Accounts are optional: booking never needs one.
 * Signed out it offers Sign in and Sign up. Signed in, the button shows the guest's initials and the
 * menu leads with a clear way into their account page, then saved stays, bookings and sign out.
 */
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { dark, toggle } = useTheme();
  const { signedIn, name, email, savedCount } = useAccount();
  const festive = useFestive();

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
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted";
  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={signedIn ? `Account menu for ${name}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          signedIn
            ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted active:scale-[0.98]"
        }
      >
        {signedIn ? initials(name) : <User className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className="absolute right-0 top-full z-50 mt-3 w-[19rem] origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {signedIn ? (
              <>
                {/* Who is signed in, and the way into the account page */}
                <div className="border-b border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-base text-primary-foreground"
                    >
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <Link
                    role="menuitem"
                    href="/account"
                    onClick={close}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
                  >
                    <UserRound className="h-4 w-4" /> My account
                  </Link>
                </div>

                <div className="p-2">
                  <Link role="menuitem" href="/account#saved" onClick={close} className={item}>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Saved stays</span>
                    {savedCount > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{savedCount}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                  <Link role="menuitem" href="/account#bookings" onClick={close} className={item}>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">My bookings</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="font-serif text-lg tracking-tight">Your account</p>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to save stays and keep track of your bookings.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    role="menuitem"
                    href="/account/sign-in"
                    onClick={close}
                    className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
                  >
                    Sign in
                  </Link>
                  <Link
                    role="menuitem"
                    href="/account/sign-up"
                    onClick={close}
                    className="rounded-xl border border-border px-4 py-2.5 text-center text-sm transition-colors hover:bg-muted active:scale-[0.98]"
                  >
                    Sign up
                  </Link>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">No account needed to book. An account just lets you save stays.</p>
              </div>
            )}

            <div className="border-t border-border p-2">
              <button
                type="button"
                role="switch"
                aria-checked={dark}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
                }}
                className={`${item} justify-between sm:hidden`}
              >
                <span className="flex items-center gap-3">
                  {dark ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />} Dark mode
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

              {festive.season && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={festive.on}
                  onClick={() => festive.setOn(!festive.on)}
                  className={`${item} justify-between`}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-muted-foreground" /> {SEASONS[festive.season].label} effects
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${festive.on ? "bg-primary" : "bg-border"}`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-background transition-transform duration-300 ${festive.on ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </span>
                </button>
              )}

              <Label>Help</Label>
              <a
                role="menuitem"
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={item}
              >
                <WhatsAppIcon className="h-4 w-4 text-muted-foreground" /> Chat with us on WhatsApp
              </a>
              {links.map((d) => (
                <Link key={d.slug} role="menuitem" href={`/legal/${d.slug}`} onClick={close} className={item}>
                  <FileText className="h-4 w-4 text-muted-foreground" /> {d.label}
                </Link>
              ))}
            </div>

            {signedIn && (
              <form action={signOutAction} className="border-t border-border p-2">
                <button type="submit" role="menuitem" className={item}>
                  <LogOut className="h-4 w-4 text-muted-foreground" /> Sign out
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
