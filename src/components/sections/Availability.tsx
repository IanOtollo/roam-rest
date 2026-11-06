"use client";

import { useBooking } from "@/components/booking/BookingContext";
import { Calendar } from "@/components/booking/Calendar";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

export function Availability() {
  const { property, unitData, nights, hint } = useBooking();
  return (
    <Reveal id="availability" className="scroll-mt-24">
      <SectionHeading eyebrow="Availability" title="Pick your nights" />
      <p className="-mt-4 mb-8 text-muted-foreground">
        Showing <span className="text-foreground">{unitData.label}</span>.
        {property.bookings.length > 0 && " Struck-through dates are taken."} Minimum stay {property.minNights} nights.
      </p>
      {property.availabilityKnown === false && (
        <p role="status" className="mb-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          Live availability couldn&apos;t be loaded just now, so the calendar may be out of date. Please message us to confirm your dates
          before booking.
        </p>
      )}
      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
        <Calendar />
        <p role="status" className="mt-6 min-h-6 text-sm text-accent">
          {hint ?? (nights > 0 ? `${nights} nights selected.` : "")}
        </p>
      </div>
    </Reveal>
  );
}
