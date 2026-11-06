"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, LogOut } from "lucide-react";
import { cn, ease } from "@/lib/utils";
import { brand } from "@/lib/property";
import { logoutAction } from "@/app/admin/actions";

type Badges = { bookings: number; reviews: number };

const links = [
  { href: "/admin", label: "Overview", exact: true, badge: undefined },
  { href: "/admin/properties", label: "Properties", exact: false, badge: undefined },
  { href: "/admin/bookings", label: "Bookings", exact: false, badge: "bookings" as const },
  { href: "/admin/reviews", label: "Reviews", exact: false, badge: "reviews" as const },
];

function Logo({ className }: { className: string }) {
  // Dark mode uses the light-lettered copy of the same artwork.
  return (
    <>
      <Image src="/brand/logo-mark.png" alt="" width={480} height={344} priority className={cn(className, "dark:hidden")} />
      <Image src="/brand/logo-mark-dark.png" alt="" width={480} height={344} priority className={cn(className, "hidden dark:block")} />
    </>
  );
}

function SignOut({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm transition-colors hover:bg-muted active:scale-[0.98]",
          className,
        )}
      >
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </form>
  );
}

/**
 * Admin navigation. On large screens it is an arch-topped side panel (the same arch as the
 * photos on the site): the logo sits in the dome, the sections are numbered, and a small sun
 * glides down to the page you are on. On phones it becomes a compact bar.
 */
export function AdminNav({ badges }: { badges: Badges }) {
  const path = usePathname();
  const isActive = (l: (typeof links)[number]) => (l.exact ? path === l.href : path.startsWith(l.href));

  return (
    <>
      {/* Phones and tablets */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="h-8 w-auto" />
            <span className="font-serif text-lg tracking-tight">Admin</span>
          </Link>
          <SignOut />
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {links.map((l) => {
            const n = l.badge ? badges[l.badge] : 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l) ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors",
                  isActive(l) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {l.label}
                {n > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{n}</span>}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Large screens: the arch */}
      <aside
        aria-label="Admin sidebar"
        className="relative hidden w-64 shrink-0 flex-col overflow-hidden rounded-t-full border border-border/60 bg-card lg:sticky lg:top-6 lg:flex lg:h-[calc(100svh-3rem)]"
      >
        {/* The dome: logo and title */}
        <div className="flex flex-col items-center px-6 pb-6 pt-14 text-center">
          <Logo className="h-14 w-auto" />
          <p className="mt-3 font-serif text-xl tracking-tight">{brand.name}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        </div>

        {/* Numbered sections with the gliding sun */}
        <nav aria-label="Admin" className="relative flex-1 px-6">
          <span aria-hidden="true" className="absolute bottom-2 left-[2.1rem] top-2 w-px bg-border" />
          <ol className="relative space-y-1">
            {links.map((l, i) => {
              const active = isActive(l);
              const n = l.badge ? badges[l.badge] : 0;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-4 rounded-xl py-3 pl-6 pr-3 transition-colors hover:bg-muted/60",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {/* The sun: one element that glides between sections */}
                    <span aria-hidden="true" className="absolute left-0 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
                      {active ? (
                        <motion.span
                          layoutId="admin-sun"
                          transition={{ type: "spring", stiffness: 320, damping: 26 }}
                          className="h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_14px_hsl(var(--accent)/0.85)]"
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-border transition-colors group-hover:bg-muted-foreground" />
                      )}
                    </span>
                    <span className="font-serif text-sm italic text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("flex-1 font-serif text-lg tracking-tight transition-transform duration-300", active ? "italic" : "group-hover:translate-x-0.5")}>
                      {l.label}
                    </span>
                    {n > 0 && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{n}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Actions */}
        <div className="relative px-6 pb-8 pt-6">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-full border border-border bg-background/70 px-4 py-2 text-sm transition-colors hover:bg-muted active:scale-[0.98]"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <SignOut className="w-full justify-between" />
          </div>
        </div>
      </aside>
    </>
  );
}
