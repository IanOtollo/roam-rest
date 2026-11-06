"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StaysBrowser } from "@/components/browse/StaysBrowser";
import { HomeHero } from "@/components/sections/HomeHero";
import { LIVE_DATA } from "@/components/ConvexClientProvider";
import type { Property } from "@/lib/property";

function Body({ properties }: { properties: Property[] }) {
  const cities = [...new Set(properties.map((p) => p.city))];
  return (
    <>
      <HomeHero properties={properties} cities={cities} />
      <section id="stays" className="scroll-mt-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <StaysBrowser properties={properties} />
        </div>
      </section>
    </>
  );
}

/** Starts from what the server rendered, then follows the database live. */
function LiveBody({ initial }: { initial: Property[] }) {
  const live = useQuery(api.properties.list) as unknown as Property[] | undefined;
  return <Body properties={live && live.length > 0 ? live : initial} />;
}

export function HomeContent({ initial }: { initial: Property[] }) {
  return LIVE_DATA ? <LiveBody initial={initial} /> : <Body properties={initial} />;
}
