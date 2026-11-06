"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/property";
import { useBooking } from "@/components/booking/BookingContext";

export function ShareButton({ className, label = true }: { className?: string; label?: boolean }) {
  const { property, shareUrl } = useBooking();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${property.title} · ${brand.name}`,
          text: `${property.title}, ${property.area}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share this stay"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm transition-colors hover:bg-muted active:scale-[0.98]",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {label && (copied ? "Link copied" : "Share")}
    </button>
  );
}
