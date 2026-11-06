import { api } from "../../../../convex/_generated/api";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { PageTitle } from "@/components/admin/ui";
import { adminQuery, requireSession } from "@/lib/admin/server";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  await requireSession();
  const [properties, data] = await Promise.all([
    adminQuery(api.properties.adminList, {}),
    adminQuery(api.reviews.adminList, {}),
  ]);
  return (
    <>
      <PageTitle title="Reviews" hint="Only guests who stayed can leave a review, through a personal one-time link. You approve each one before it goes live." />
      <ReviewsManager
        properties={properties.map((p) => ({ slug: p.slug, title: p.title, units: p.units.map((u) => ({ id: u.id, label: u.label })) }))}
        reviews={data.reviews.map((r) => ({
          _id: r._id,
          propertySlug: r.propertySlug,
          author: r.author,
          quote: r.quote,
          stayed: r.stayed,
          nights: r.nights,
          unit: r.unit,
          status: r.status,
        }))}
        invites={data.invites.map((i) => ({
          id: i.id,
          propertySlug: i.propertySlug,
          unit: i.unit,
          stayed: i.stayed,
          guestName: i.guestName,
        }))}
      />
    </>
  );
}
