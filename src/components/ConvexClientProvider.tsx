"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

/**
 * Opens one live connection to Convex for the whole site, so data (availability, rates,
 * reviews, new properties) updates on screen the moment it changes, with no refresh.
 * Without a Convex address (local preview of the starter data) it does nothing.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
let client: ConvexReactClient | null = null;

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!url) return <>{children}</>;
  client ??= new ConvexReactClient(url);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

/** True when live data is available (a Convex address is configured). */
export const LIVE_DATA = !!url;
