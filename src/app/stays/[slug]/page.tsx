import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { StayContent } from "@/components/live/StayContent";
import { getProperties, getPropertyBySlug } from "@/lib/store";

type Params = { params: { slug: string } };

// New properties added in /admin appear without a redeploy; pages also refresh every minute.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getProperties()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return {};
  return {
    title: property.title,
    description: `${property.tagline} ${property.area}, ${property.city}. Sleeps up to ${property.maxGuests}.`,
  };
}

export default async function StayPage({ params }: Params) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) {
    // An old web address (the owner renamed the property): send visitors to the new one.
    const moved = (await getProperties()).find((p) => p.previousSlugs?.includes(params.slug));
    if (moved) permanentRedirect(`/stays/${moved.slug}`);
    notFound();
  }

  return (
    <>
      <StayContent initial={property} />
      <Footer padForBar />
    </>
  );
}
