import { renderStayOg } from "@/lib/ogStay";

export const alt = "Roam & Rest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
export const runtime = "nodejs";
export const revalidate = 60;

export default function Image({ params }: { params: { slug: string } }) {
  return renderStayOg(params.slug);
}
