const LIVE = "https://www.roamandrest.co.ke";

/**
 * Public address used in the sitemap and robots.txt. Uses NEXT_PUBLIC_SITE_URL when it is a real
 * address, otherwise the live domain, so search engines never receive localhost or placeholder links.
 */
export function siteUrl(): string {
  const v = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\//.test(v) && !/your-project|localhost|127\.0\.0\.1/.test(v) ? v : LIVE;
}
