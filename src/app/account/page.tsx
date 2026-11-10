import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, CalendarDays, Heart, LogOut, MapPin, Trash2, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { adminQuery } from "@/lib/admin/server";
import { currentGuest } from "@/lib/guest/server";
import { brand } from "@/lib/property";
import { getProperties } from "@/lib/store";
import { deleteAccountAction, signOutAction } from "./actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS = {
  pending: { label: "Awaiting confirmation", dot: "bg-amber-500" },
  booked: { label: "Confirmed", dot: "bg-emerald-600" },
  declined: { label: "Not available", dot: "bg-stone-400" },
} as const;

const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const year = (iso: string) => iso.slice(0, 4);

const initials = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "G";

function Empty({ icon: Icon, title, text, href, cta }: { icon: typeof Heart; title: string; text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </span>
      <p className="mt-4 font-serif text-lg tracking-tight">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm transition-colors hover:bg-muted active:scale-[0.98]"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function AccountPage() {
  const guest = await currentGuest();
  if (!guest) redirect("/account/sign-in");

  const [properties, trips] = await Promise.all([
    getProperties(),
    adminQuery(api.guests.trips, { id: guest.id }).catch(() => []),
  ]);
  const bySlug = new Map(properties.map((p) => [p.slug, p]));
  const saved = guest.saved.map((s) => bySlug.get(s)).filter((p) => !!p);

  return (
    <>
      <Navbar back={{ href: "/", label: "Home" }} />
      <main className="px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* Profile */}
          <header className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-2xl text-primary-foreground sm:h-20 sm:w-20 sm:text-3xl"
              >
                {initials(guest.name)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-accent">Your account</p>
                <h1 className="mt-1 truncate font-serif text-2xl tracking-tight sm:text-3xl">{guest.name}</h1>
                <p className="truncate text-sm text-muted-foreground">{guest.email}</p>
              </div>
            </div>
            <form action={signOutAction}>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm transition-colors hover:bg-muted active:scale-[0.98] sm:w-auto">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </header>

          {/* At a glance */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="#saved"
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted sm:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/10">
                <Heart className="h-5 w-5 text-rose-500" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block font-serif text-2xl leading-none tracking-tight">{saved.length}</span>
                <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">Saved {saved.length === 1 ? "stay" : "stays"}</span>
              </span>
            </Link>
            <Link
              href="#bookings"
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted sm:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                <CalendarCheck className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block font-serif text-2xl leading-none tracking-tight">{trips.length}</span>
                <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">{trips.length === 1 ? "Booking" : "Bookings"}</span>
              </span>
            </Link>
          </div>

          {/* Saved stays */}
          <section id="saved" aria-labelledby="saved-h" className="scroll-mt-24">
            <h2 id="saved-h" className="font-serif text-2xl tracking-tight">
              Saved stays
            </h2>
            <div className="mt-5">
              {saved.length === 0 ? (
                <Empty
                  icon={Heart}
                  title="Nothing saved yet"
                  text="Tap the heart on any stay to keep it here, so it's easy to find again."
                  href="/#stays"
                  cta="Browse stays"
                />
              ) : (
                <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6">
                  {saved.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/stays/${p.slug}`} className="group block">
                        <div className="relative overflow-hidden rounded-2xl bg-muted">
                          <Image
                            src={p.cover}
                            alt={p.title}
                            width={960}
                            height={1280}
                            sizes="(min-width: 640px) 30vw, 48vw"
                            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm sm:left-3 sm:top-3">
                            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" strokeWidth={1.75} />
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-snug sm:text-base">{p.title}</p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {p.area}, {p.city}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Bookings */}
          <section id="bookings" aria-labelledby="bookings-h" className="scroll-mt-24">
            <h2 id="bookings-h" className="font-serif text-2xl tracking-tight">
              My bookings
            </h2>
            <div className="mt-5">
              {trips.length === 0 ? (
                <Empty
                  icon={CalendarCheck}
                  title="No bookings yet"
                  text="When you reserve a stay on WhatsApp while signed in, it shows up here with its status."
                  href="/#stays"
                  cta="Find a stay"
                />
              ) : (
                <ul className="space-y-3">
                  {trips.map((t, i) => {
                    const s = STATUS[t.status];
                    const p = bySlug.get(t.slug);
                    return (
                      <li key={i}>
                        <Link
                          href={`/stays/${t.slug}`}
                          className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:bg-muted sm:gap-5 sm:p-4"
                        >
                          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-28">
                            {p && <Image src={p.cover} alt="" fill sizes="112px" className="object-cover" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{t.title}</span>
                            {p && (
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {p.area}, {p.city}
                              </span>
                            )}
                            <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" /> {day(t.start)} to {day(t.end)} {year(t.end)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> {t.guests} {t.guests === 1 ? "guest" : "guests"} · {t.nights}{" "}
                                {t.nights === 1 ? "night" : "nights"}
                              </span>
                            </span>
                            {t.unitLabel && <span className="mt-1 block truncate text-xs text-muted-foreground">{t.unitLabel}</span>}
                          </span>
                          <span className="hidden shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium sm:flex">
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                          </span>
                        </Link>
                        <p className="mt-2 flex items-center gap-2 px-1 text-xs font-medium sm:hidden">
                          <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Delete: a quiet text link, not a panel */}
          <details className="text-sm">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <Trash2 className="h-4 w-4" /> Delete my account
            </summary>
            <p className="mt-3 max-w-lg text-muted-foreground">
              This removes your account and your saved stays. Past booking requests stay with the host, but are no longer linked to you.
              It can&apos;t be undone.
            </p>
            <form action={deleteAccountAction} className="mt-4">
              <button className="rounded-full border border-rose-500/40 px-5 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-400">
                Yes, delete my account
              </button>
            </form>
          </details>

          <p className="border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
        </div>
      </main>
    </>
  );
}
