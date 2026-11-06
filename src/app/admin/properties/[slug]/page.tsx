import { notFound } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { blankProperty, PropertyForm, type FormState } from "@/components/admin/PropertyForm";
import { PageTitle } from "@/components/admin/ui";
import { adminQuery, requireSession } from "@/lib/admin/server";

export const metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params }: { params: { slug: string } }) {
  await requireSession();
  const isNew = params.slug === "new";

  let initial: FormState = blankProperty;
  let urls: Record<string, string> = {};

  if (!isNew) {
    const data = await adminQuery(api.properties.adminGet, { slug: params.slug });
    if (!data) notFound();
    const { _id, _creationTime, published, sortOrder, updatedAt, previousSlugs, ...fields } = data.property;
    void _id;
    void _creationTime;
    void published;
    void sortOrder;
    void updatedAt;
    void previousSlugs;
    initial = fields;
    urls = data.urls;
  }

  return (
    <>
      <PageTitle
        title={isNew ? "Add a property" : initial.title}
        hint={isNew ? "Fill this in, add photos, then save. It stays hidden until you publish it." : "Changes appear on the website as soon as you save."}
      />
      <PropertyForm key={params.slug} initial={initial} urls={urls} isNew={isNew} />
    </>
  );
}
