import type { Metadata } from "next";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { adminQuery } from "@/lib/admin/server";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { answerInquiry } from "./actions";

// The host's private link: never indexed, never cached.
export const metadata: Metadata = { title: "Booking inquiry", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const longDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

async function load(token: string) {
  try {
    return await adminQuery(api.inquiries.preview, { token });
  } catch {
    return null;
  }
}

export default async function InquiryPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { answer?: string; error?: string };
}) {
  const info = await load(params.token);
  const lean = searchParams.answer === "declined" ? "declined" : "booked";

  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-xl">
          {!info ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
              <h1 className="font-serif text-2xl tracking-tight">This link can't be used</h1>
              <p className="mt-2 text-muted-foreground">It may have been copied incorrectly. Use the buttons in the original email.</p>
              <Link href="/" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
                Back to the site
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Booking inquiry</p>
              <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">{info.propertyTitle}</h1>
              <dl className="mt-6 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card text-sm">
                {[
                  ...(info.showUnit ? [["Option", info.unitLabel]] : []),
                  ["Check-in", longDate(info.start)],
                  ["Check-out", longDate(info.end)],
                  ["Nights", String(info.nights)],
                  ["Guests", String(info.guests)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-5 py-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              {searchParams.error && (
                <p role="alert" className="mt-6 rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                  {searchParams.error}
                </p>
              )}

              {info.status === "booked" && (
                <p className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
                  <strong>Recorded as booked.</strong> These nights are now crossed out on the website calendar.
                </p>
              )}
              {info.status === "declined" && (
                <p className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
                  <strong>Marked as not successful.</strong> The dates stay open on the website calendar.
                </p>
              )}
              {info.status === "pending" && (
                <div className="mt-8">
                  <p className="text-sm text-muted-foreground">
                    {lean === "booked"
                      ? "You chose Booking successful. Confirming crosses these nights out on the website calendar."
                      : "You chose Not successful. Confirming leaves these nights open."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <form
                      action={async () => {
                        "use server";
                        await answerInquiry(params.token, "booked");
                      }}
                    >
                      <button
                        type="submit"
                        className={`w-full rounded-xl px-6 py-4 text-sm font-medium active:scale-[0.98] ${
                          lean === "booked"
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border bg-background hover:bg-muted"
                        }`}
                      >
                        Booking successful
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await answerInquiry(params.token, "declined");
                      }}
                    >
                      <button
                        type="submit"
                        className={`w-full rounded-xl px-6 py-4 text-sm font-medium active:scale-[0.98] ${
                          lean === "declined"
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border bg-background hover:bg-muted"
                        }`}
                      >
                        Not successful
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
