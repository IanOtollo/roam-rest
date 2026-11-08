import type { MetadataRoute } from "next";
import { legalDocs } from "@/lib/legal";
import { getProperties } from "@/lib/store";
import { siteUrl } from "@/lib/site";

// Rebuilt every few minutes so a property added in /admin shows up without a redeploy.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const properties = await getProperties();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...properties.map((p) => ({
      url: `${base}/stays/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: `${base}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...legalDocs.map((d) => ({
      url: `${base}/legal/${d.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
