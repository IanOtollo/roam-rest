import Link from "next/link";
import { ArrowRight, CalendarCheck, Home, MessageSquareQuote } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { LoginForm } from "@/components/admin/LoginForm";
import { Card, formatDay, nightsBetween, Notice, PageTitle } from "@/components/admin/ui";
import { adminQuery, convexReady, hasSession } from "@/lib/admin/server";

export default async function AdminHome() {
  if (!(await hasSession())) return <LoginForm />;

  if (!convexReady()) {
    return (
      <>
        <PageTitle title="Almost there" />
        <Card>
          <p className="text-muted-foreground">
            The admin is signed in, but the database isn't connected yet. Add <code>NEXT_PUBLIC_CONVEX_URL</code> and{" "}
            <code>ADMIN_API_SECRET</code> to <code>.env.local</code> (see <code>.env.example</code>), then restart the site.
          </p>
        </Card>
      </>
    );
  }

  const [properties, bookings, review] = await Promise.all([
    adminQuery(api.properties.adminList, {}),
    adminQuery(api.bookings.adminList, {}),
    adminQuery(api.reviews.adminList, {}),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && b.end >= today)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  const pending = review.reviews.filter((r) => r.status === "pending");
  const titleOf = (slug: string) => properties.find((p) => p.slug === slug)?.title ?? slug;
  const published = properties.filter((p) => p.published).length;

  const stats = [
    { icon: Home, label: "Published properties", value: `${published} of ${properties.length}`, href: "/admin/properties" },
    { icon: CalendarCheck, label: "Upcoming bookings", value: String(upcoming.length), href: "/admin/bookings" },
    { icon: MessageSquareQuote, label: "Reviews waiting", value: String(pending.length), href: "/admin/reviews" },
  ];

  return (
    <>
      <PageTitle title="Overview" hint="Everything at a glance. Changes you make here appear on the website straight away." />

      {properties.length === 0 && (
        <div className="mb-8">
          <Notice>
            No properties in the database yet.{" "}
            <Link href="/admin/properties" className="underline underline-offset-4">
              Add your first property
            </Link>
            .
          </Notice>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="mt-4 font-serif text-3xl tracking-tight">{value}</p>
            <p className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              {label}
              <ArrowRight className="arrow-right h-4 w-4" />
            </p>
          </Link>
        ))}
      </div>

      <Card title="Next arrivals" className="mt-8">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings. Add one when you confirm a stay.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.slice(0, 6).map((b) => (
              <li key={b._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <span className="font-medium">{formatDay(b.start)}</span> to {formatDay(b.end)}
                  <span className="text-muted-foreground"> · {nightsBetween(b.start, b.end)} nights</span>
                </span>
                <span className="text-muted-foreground">
                  {titleOf(b.propertySlug)}
                  {b.guestName ? ` · ${b.guestName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
