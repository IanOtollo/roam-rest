"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollToTop } from "./ScrollToTop";
import { WhatsAppButton } from "./WhatsAppButton";

/** Bottom-right stack: back-to-top (once scrolled) above the WhatsApp button. */
export function FloatingActions() {
  const pathname = usePathname();
  // Not needed on the private admin screens.
  if (pathname.startsWith("/admin")) return null;
  return (
    <div
      className={cn(
        "fixed right-4 z-40 flex flex-col items-center gap-3 sm:right-6",
        // Sit above the mobile booking bar on stay pages.
        pathname.startsWith("/stays") ? "bottom-24 lg:bottom-6" : "bottom-6",
      )}
    >
      {/* On phones only WhatsApp floats, so nothing covers form controls; browsers scroll to top natively. */}
      <div className="hidden sm:block">
        <ScrollToTop />
      </div>
      <WhatsAppButton />
    </div>
  );
}
