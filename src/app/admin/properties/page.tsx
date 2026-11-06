import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PropertyList } from "@/components/admin/PropertyList";
import { btnPrimary, PageTitle } from "@/components/admin/ui";
import { adminQuery, requireSession } from "@/lib/admin/server";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  await requireSession();
  const properties = await adminQuery(api.properties.adminList, {});
  return (
    <>
      <PageTitle
        title="Properties"
        hint="The order here is the order visitors see: first on the home carousel and in the list."
        action={
          <Link href="/admin/properties/new" className={btnPrimary}>
            <Plus className="h-4 w-4" /> Add property
          </Link>
        }
      />
      <PropertyList
        items={properties.map((p) => ({
          slug: p.slug,
          title: p.title,
          area: `${p.area}, ${p.city}`,
          published: p.published,
          coverUrl: p.coverUrl,
          options: p.units.length,
        }))}
      />
    </>
  );
}
