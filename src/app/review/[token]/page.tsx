import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ReviewForm } from "@/components/ReviewForm";

// A personal link: never indexed, never cached.
export const metadata: Metadata = { title: "Leave a review", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: { token: string } }) {
  let info: Awaited<ReturnType<typeof loadInfo>> = null;
  try {
    info = await loadInfo(params.token);
  } catch {
    info = null;
  }

  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-xl">
          {info ? (
            <>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Your review</p>
              <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">How was {info.propertyTitle}?</h1>
              <p className="mt-3 text-muted-foreground">
                {info.unitLabel ? `${info.unitLabel} · ` : ""}Stayed {info.stayed} · {info.nights} {info.nights === 1 ? "night" : "nights"}
              </p>
              <div className="mt-8">
                <ReviewForm token={params.token} defaultName={info.guestName} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
              <h1 className="font-serif text-2xl tracking-tight">This link can't be used</h1>
              <p className="mt-2 text-muted-foreground">
                It may have already been used, or it has expired. If you'd still like to share your experience, please contact us.
              </p>
              <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
                Back to the website
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function loadInfo(token: string) {
  return fetchQuery(api.reviews.inviteInfo, { token });
}
