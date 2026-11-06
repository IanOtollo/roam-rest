"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { BookingProvider } from "@/components/booking/BookingContext";
import { MobileBar } from "@/components/booking/MobileBar";
import { Navbar } from "@/components/layout/Navbar";
import { Amenities } from "@/components/sections/Amenities";
import { Availability } from "@/components/sections/Availability";
import { Location } from "@/components/sections/Location";
import { PropertyHero } from "@/components/sections/PropertyHero";
import { Reviews } from "@/components/sections/Reviews";
import { UnitPicker } from "@/components/sections/UnitPicker";
import { Walkthrough } from "@/components/sections/Walkthrough";
import { LIVE_DATA } from "@/components/ConvexClientProvider";
import { ShareButton } from "@/components/ui/ShareButton";
import type { Property } from "@/lib/property";

function Body({ property, gone = false }: { property: Property; gone?: boolean }) {
  return (
    <BookingProvider property={property}>
      <Navbar back={{ href: "/#stays", label: "All stays" }}>
        <ShareButton className="hidden sm:inline-flex" />
        <a
          href="#book"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Reserve
        </a>
      </Navbar>
      {gone && (
        <p role="status" className="border-b border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm">
          This stay is no longer available. Message us and we&apos;ll gladly suggest another.
        </p>
      )}
      <main>
        <PropertyHero />
        <Walkthrough />

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
            <div className="space-y-16 lg:space-y-24">
              <UnitPicker />
              <Amenities />
              <Availability />
              <Reviews />
              <Location />
            </div>
            <aside className="order-first lg:order-last">
              <div className="lg:sticky lg:top-24">
                <BookingPanel />
              </div>
            </aside>
          </div>
        </section>
      </main>
      <MobileBar />
    </BookingProvider>
  );
}

/**
 * Starts from what the server rendered (fast first view), then follows the database live:
 * a newly booked date is struck through, a changed rate or a new review appears, without
 * anyone refreshing. Their selected dates and option are kept while data updates.
 */
function LiveBody({ initial }: { initial: Property }) {
  const live = useQuery(api.properties.bySlug, { slug: initial.slug }) as unknown as Property | null | undefined;
  return <Body property={live ?? initial} gone={live === null} />;
}

export function StayContent({ initial }: { initial: Property }) {
  return LIVE_DATA ? <LiveBody initial={initial} /> : <Body property={initial} />;
}
