"use client";

import { Lock, MapPin } from "lucide-react";
import { useBooking } from "@/components/booking/BookingContext";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

export function Location() {
  const { property } = useBooking();
  return (
    <Reveal>
      <SectionHeading eyebrow="Where" title={`${property.area}, ${property.city}`} />
      <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
        <MapPin className="mt-1 h-6 w-6 shrink-0 text-accent" strokeWidth={1.5} />
        <div className="space-y-3">
          <p>{property.locationBlurb}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" /> {property.locationNote}
          </p>
          <p className="text-sm text-muted-foreground">
            Check-in from {property.checkIn} · Check-out by {property.checkOut}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
