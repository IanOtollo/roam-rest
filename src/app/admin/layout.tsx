import type { Metadata } from "next";
import { api } from "../../../convex/_generated/api";
import { AdminNav } from "@/components/admin/AdminNav";
import { adminQuery, convexReady, hasSession } from "@/lib/admin/server";
import { brand } from "@/lib/property";

// The admin area is never indexed by search engines.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

// Depends on the visitor's cookie, so it is never cached or pre-built.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await hasSession();

  // The sign-in screen is a single full-height page and draws its own layout.
  if (!signedIn) return <div className="bg-background">{children}</div>;

  // Small counters in the sidebar: upcoming bookings and reviews waiting for approval.
  let badges = { bookings: 0, reviews: 0 };
  if (convexReady()) {
    try {
      const [bookings, reviews] = await Promise.all([
        adminQuery(api.bookings.adminList, {}),
        adminQuery(api.reviews.adminList, {}),
      ]);
      const today = new Date().toISOString().slice(0, 10);
      badges = {
        bookings: bookings.filter((b) => b.status === "confirmed" && b.end >= today).length,
        reviews: reviews.reviews.filter((r) => r.status === "pending").length,
      };
    } catch {
      /* the sidebar works without counters */
    }
  }

  return (
    <div className="min-h-screen bg-background lg:flex lg:gap-8 lg:p-6">
      <AdminNav badges={badges} />
      <div className="flex min-h-[calc(100svh-4rem)] min-w-0 flex-1 flex-col lg:min-h-[calc(100svh-3rem)]">
        <main className="w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-0 lg:py-6">{children}</main>
        <p className="mt-auto border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
