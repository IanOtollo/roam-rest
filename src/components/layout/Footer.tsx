import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { TikTokIcon } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/property";
import { legalDocs } from "@/lib/legal";
import { getProperties } from "@/lib/store";
import { Reveal } from "@/components/ui/Reveal";

const linkClass = "text-sm text-foreground/70 transition-colors hover:text-foreground";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-foreground/50">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

/**
 * Site footer: brand and contact, the stays on offer, guest information and the
 * legal documents. `padForBar` leaves room for the fixed mobile booking bar.
 */
export async function Footer({ padForBar = false }: { padForBar?: boolean }) {
  const properties = await getProperties();
  const guestDocs = legalDocs.filter((d) => d.group === "guest" && d.footer);
  const legal = legalDocs.filter((d) => d.group === "legal" && d.footer);

  return (
    <footer className="bg-muted text-foreground border-t border-border">
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-12 sm:px-6 lg:px-8 lg:pt-14">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
            {/* Brand + contact */}
            <div>
              {/* Transparent logo, shown directly on the footer (no tile or backing). */}
              <Link href="/" aria-label={brand.name} className="inline-block">
                <Image src="/brand/logo.png" alt={brand.name} width={900} height={754} className="h-20 w-auto dark:hidden" />
                <Image
                  src="/brand/logo-dark.png"
                  alt={brand.name}
                  width={900}
                  height={754}
                  className="hidden h-20 w-auto dark:block"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm text-foreground/70">{brand.tagline}</p>

              <ul className="mt-8 space-y-3 text-sm text-foreground/70">
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0" /> {brand.region}
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${brand.phoneLink}`} className="transition-colors hover:text-foreground">
                    {brand.phone}
                  </a>
                </li>
                {brand.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${brand.email}`} className="transition-colors hover:text-foreground">
                      {brand.email}
                    </a>
                  </li>
                )}
              </ul>

              <div className="mt-5 flex items-center gap-2">
                <a
                  href={`https://www.instagram.com/${brand.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram @${brand.instagram} (opens in a new tab)`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:bg-foreground/10"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.tiktok.com/@${brand.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`TikTok @${brand.tiktok} (opens in a new tab)`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:bg-foreground/10"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3">
              <Column title="Stays">
                {properties.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/stays/${p.slug}`} className={linkClass}>
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/#stays" className={linkClass}>
                    All stays
                  </Link>
                </li>
              </Column>

              <Column title="Guest information">
                {guestDocs.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/legal/${d.slug}`} className={linkClass}>
                      {d.label}
                    </Link>
                  </li>
                ))}
              </Column>

              <Column title="Legal">
                {legal.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/legal/${d.slug}`} className={linkClass}>
                      {d.label}
                    </Link>
                  </li>
                ))}
              </Column>
            </nav>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-2 border-t border-foreground/10 pt-5 text-xs text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
          <p>All prices are in Kenyan shillings (KES).</p>
        </div>
      </div>

      {/* Studio credit: a slim last line, underlined, with a small diagonal arrow. */}
      <div className={cn("px-4 pb-5 pt-1 text-center sm:px-6 lg:px-8", padForBar && "pb-24 lg:pb-5")}>
        <a
          href="https://www.marabimadeit.co.ke/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Marabi made it (opens in a new tab)"
          className="group inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
        >
          <span className="underline underline-offset-4">Marabi made it</span>
          <ArrowUpRight className="arrow-diag h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}
