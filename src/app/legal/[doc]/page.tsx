import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { ContactActions } from "@/components/legal/ContactActions";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { formatLegalDate, getLegalDoc, legalDocs, neighbours, readingMinutes } from "@/lib/legal";

type Params = { params: { doc: string } };

export const revalidate = 300;
export function generateStaticParams() {
  return legalDocs.map((d) => ({ doc: d.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const doc = getLegalDoc(params.doc);
  return doc ? { title: doc.title, description: doc.summary } : {};
}

function DocLinks({ group, current }: { group: "legal" | "guest"; current: string }) {
  return (
    <>
      {legalDocs
        .filter((d) => d.group === group)
        .map((d) => (
          <Link
            key={d.slug}
            href={`/legal/${d.slug}`}
            aria-current={d.slug === current ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2.5 text-sm transition-colors",
              d.slug === current ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {d.label}
          </Link>
        ))}
    </>
  );
}

export default function LegalPage({ params }: Params) {
  const doc = getLegalDoc(params.doc);
  if (!doc) notFound();
  const { prev, next } = neighbours(doc.slug);

  return (
    <>
      <Navbar back={{ href: "/legal", label: "All policies" }} />
      <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
          {/* Sidebar: every document, then this document's contents */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <Link href="/legal" className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Legal &amp; guest information
            </Link>

            <nav aria-label="Documents" className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible">
              <p className="hidden px-4 pb-1 pt-2 text-xs text-muted-foreground lg:block">Legal</p>
              <DocLinks group="legal" current={doc.slug} />
              <p className="hidden px-4 pb-1 pt-4 text-xs text-muted-foreground lg:block">Guest information</p>
              <DocLinks group="guest" current={doc.slug} />
            </nav>

            <nav aria-label="On this page" className="mt-8 hidden border-t border-border pt-6 lg:block">
              <p className="px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">On this page</p>
              <ol className="mt-3 space-y-0.5">
                {doc.sections.map((s, i) => (
                  <li key={s.heading}>
                    <a
                      href={`#s-${i}`}
                      className="block rounded-lg px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Roam &amp; Rest</p>
              <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{doc.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{doc.summary}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Last updated {formatLegalDate(doc.updated)}</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {readingMinutes(doc)} min read
                </span>
              </p>
            </Reveal>

            {/* At a glance */}
            <Reveal className="mt-10">
              <div className="rounded-2xl border border-border bg-muted/50 p-6 sm:p-8">
                <p className="font-serif text-xl tracking-tight">At a glance</p>
                <ul className="mt-4 space-y-3">
                  {doc.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <div className="mt-12 space-y-12 border-t border-border pt-12">
              {doc.sections.map((s, i) => (
                <Reveal key={s.heading}>
                  <section id={`s-${i}`} aria-labelledby={`h-${i}`} className="scroll-mt-24">
                    <h2 id={`h-${i}`} className="text-2xl">
                      <span className="mr-3 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      {s.heading}
                    </h2>
                    <div className="mt-4 space-y-4 leading-relaxed text-foreground/80">
                      {s.paras?.map((p) => <p key={p}>{p}</p>)}
                      {s.items && (
                        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
                          {s.items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {s.contact && <ContactActions topic={doc.title} />}
                  </section>
                </Reveal>
              ))}
            </div>

            {/* Previous / next */}
            <nav aria-label="More documents" className="mt-16 grid gap-4 border-t border-border pt-10 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/legal/${prev.slug}`}
                  className="group rounded-2xl border border-border p-5 transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowLeft className="arrow-left h-3.5 w-3.5" /> Previous
                  </span>
                  <span className="mt-1 block font-serif text-lg tracking-tight">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/legal/${next.slug}`}
                  className="group rounded-2xl border border-border p-5 text-right transition-colors hover:bg-muted"
                >
                  <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    Next <ArrowRight className="arrow-right h-3.5 w-3.5" />
                  </span>
                  <span className="mt-1 block font-serif text-lg tracking-tight">{next.title}</span>
                </Link>
              )}
            </nav>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
