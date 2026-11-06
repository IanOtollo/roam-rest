"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isNightBooked, isRangeFree, nightsBetween, todayKey } from "@/lib/availability";
import { getUnit, type Property, type Unit } from "@/lib/property";

interface BookingState {
  property: Property;
  unit: string;
  unitData: Unit;
  setUnit: (id: string) => void;
  start: string | null;
  end: string | null;
  guests: number;
  setGuests: (n: number) => void;
  pick: (day: string) => void;
  clear: () => void;
  hint: string | null;
  nights: number;
  total: number;
  shareUrl: () => string;
}

const Ctx = createContext<BookingState | null>(null);

export function useBooking() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBooking must be used inside <BookingProvider>");
  return v;
}

export function BookingProvider({ property, children }: { property: Property; children: React.ReactNode }) {
  const [unit, setUnitState] = useState<string>(property.units[0].id);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [guests, setGuestsState] = useState(2);
  const [hint, setHint] = useState<string | null>(null);

  const unitData = getUnit(property, unit);

  // Restore a shared link (?unit=main&in=2026-12-01&out=2026-12-05&guests=4)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const u = q.get("unit");
    const chosen = property.units.find((x) => x.id === u) ?? property.units[0];
    setUnitState(chosen.id);
    const a = q.get("in");
    const b = q.get("out");
    if (
      a &&
      b &&
      a >= todayKey() &&
      nightsBetween(a, b) >= property.minNights &&
      isRangeFree(property, chosen.id, a, b)
    ) {
      setStart(a);
      setEnd(b);
    }
    const g = Number(q.get("guests"));
    if (g >= 1) setGuestsState(Math.min(g, chosen.maxGuests));
    // Runs once per property. Live data updates replace `property` often and must not reset
    // the visitor's chosen dates and option.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.slug]);

  const setUnit = useCallback(
    (id: string) => {
      const next = getUnit(property, id);
      setUnitState(next.id);
      setGuestsState((g) => Math.min(g, next.maxGuests));
      setHint(null);
      if (start && end && !isRangeFree(property, next.id, start, end)) {
        setStart(null);
        setEnd(null);
        setHint("Those dates aren't free for this option. Pick new ones.");
      }
    },
    [property, start, end],
  );

  const setGuests = useCallback(
    (n: number) => setGuestsState(Math.max(1, Math.min(n, unitData.maxGuests))),
    [unitData.maxGuests],
  );

  const pick = useCallback(
    (day: string) => {
      setHint(null);
      if (!start || (start && end)) {
        setStart(day);
        setEnd(null);
        return;
      }
      if (day <= start) {
        setStart(day);
        return;
      }
      if (nightsBetween(start, day) < property.minNights) {
        setHint(`Minimum stay is ${property.minNights} nights.`);
        return;
      }
      if (!isRangeFree(property, unit, start, day)) {
        setHint("Some of those nights are already booked.");
        if (!isNightBooked(property, unit, day)) setStart(day);
        return;
      }
      setEnd(day);
    },
    [property, start, end, unit],
  );

  const clear = useCallback(() => {
    setStart(null);
    setEnd(null);
    setHint(null);
  }, []);

  const nights = start && end ? nightsBetween(start, end) : 0;
  const total = nights * unitData.nightlyRate;

  const shareUrl = useCallback(() => {
    const url = new URL(window.location.href.split("?")[0]);
    url.searchParams.set("unit", unit);
    if (start && end) {
      url.searchParams.set("in", start);
      url.searchParams.set("out", end);
    }
    url.searchParams.set("guests", String(guests));
    return url.toString();
  }, [unit, start, end, guests]);

  const value = useMemo(
    () => ({
      property,
      unit,
      unitData,
      setUnit,
      start,
      end,
      guests,
      setGuests,
      pick,
      clear,
      hint,
      nights,
      total,
      shareUrl,
    }),
    [property, unit, unitData, setUnit, start, end, guests, setGuests, pick, clear, hint, nights, total, shareUrl],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
