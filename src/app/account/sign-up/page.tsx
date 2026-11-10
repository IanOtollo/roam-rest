import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/account/AuthForm";
import { guestAuthReady } from "@/lib/guest/session";
import { currentGuestId, safeNext } from "@/lib/guest/server";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SignUpPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next);
  if (await currentGuestId()) redirect(next);
  const google = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <>
      {/* Fixed to the window: these pages are one screen, so the page itself never scrolls. */}
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <Navbar back={{ href: "/", label: "Home" }} />
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4">
        <div className="w-full max-w-md py-4">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Your account</p>
          <h1 className="mt-2 text-3xl tracking-tight">Create an account</h1>
          <div className="mt-5">
            {guestAuthReady() ? (
              <AuthForm mode="sign-up" next={next} google={google} />
            ) : (
              <p className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
                Accounts aren&apos;t available right now. You can still book as a guest.
              </p>
            )}
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
