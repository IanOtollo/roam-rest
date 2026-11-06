import { api } from "../../../../convex/_generated/api";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PageTitle } from "@/components/admin/ui";
import { adminQuery, requireSession } from "@/lib/admin/server";

export const metadata = { title: "Bookings" };

export default async function BookingsPage() {
  await requireSession();
  const [properties, bookings] = await Promise.all([
    adminQuery(api.properties.adminList, {}),
    adminQuery(api.bookings.adminList, {}),
  ]);
  return (
    <>
      <PageTitle title="Bookings" hint="Record confirmed stays and closed dates. The calendar and search on the website update straight away." />
      <BookingsManager
        properties={properties.map((p) => ({ slug: p.slug, title: p.title, units: p.units.map((u) => ({ id: u.id, label: u.label })) }))}
        bookings={bookings.map((b) => ({
          _id: b._id,
          propertySlug: b.propertySlug,
          unit: b.unit,
          start: b.start,
          end: b.end,
          status: b.status,
          guestName: b.guestName,
          guestContact: b.guestContact,
          note: b.note,
        }))}
      />
    </>
  );
}
