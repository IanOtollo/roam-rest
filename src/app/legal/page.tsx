import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { legalDocs, readingMinutes, type LegalDoc } from "@/lib/legal";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Legal & guest information",
  description: "Our terms, privacy policy, cancellation policy, house rules, safety information and answers to common questions.",
};

function Group({ title, intro, docs }: { title: string; intro: string; docs: LegalDoc[] }) {
  return (
    <section className="mt-14 first:mt-0">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{intro}</p>
      </Reveal>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {docs.map((d) => (
          <li key={d.slug}>
            <Reveal className="h-full">
              <Link
                href={`/legal/${d.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="font-serif text-xl tracking-tight">{d.title}</span>
                  <ArrowUpRight className="arrow-diag h-5 w-5 shrink-0 text-muted-foreground" />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.summary}</span>
                <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {readingMinutes(d)} min read
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LegalHubPage() {
  return (
    <>
      <Navbar back={{ href: "/", label: "Home" }} />
      <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">Roam &amp; Rest</p>
            <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Legal &amp; guest information</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Everything you may want to know before and during a stay, in plain language: how booking works, what to
              expect, how we look after your data, and who to call if you need help.
            </p>
          </Reveal>

          <div className="mt-14">
            <Group
              title="Guest information"
              intro="Practical answers for planning and enjoying your stay."
              docs={legalDocs.filter((d) => d.group === "guest")}
            />
            <Group
              title="Legal"
              intro="The terms that apply to the website and to your booking, and how we handle your data."
              docs={legalDocs.filter((d) => d.group === "legal")}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
