"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Trash2 } from "lucide-react";
import { cancelBookingAction, createBookingAction, deleteBookingAction, type ActionResult } from "@/app/admin/actions";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { btnPrimary, btnSmall, Card, Field, formatDay, inputCls, nightsBetween, Notice } from "./ui";

type PropertyLite = { slug: string; title: string; units: { id: string; label: string }[] };
type BookingRow = {
  _id: string;
  propertySlug: string;
  unit: string;
  start: string;
  end: string;
  status: "confirmed" | "cancelled";
  guestName?: string;
  guestContact?: string;
  note?: string;
};

const looksLikePhone = (s: string) => /^[+\d][\d\s-]{7,}$/.test(s.trim());
const waLink = (s: string) => {
  let d = s.replace(/\D/g, "");
  if (d.startsWith("0")) d = `254${d.slice(1)}`;
  return `https://wa.me/${d}`;
};

export function BookingsManager({ properties, bookings }: { properties: PropertyLite[]; bookings: BookingRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [slug, setSlug] = useState(properties[0]?.slug ?? "");
  const property = properties.find((p) => p.slug === slug) ?? properties[0];
  const [unit, setUnit] = useState(property?.units[0]?.id ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [showPast, setShowPast] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const mine = useMemo(() => bookings.filter((b) => b.propertySlug === slug), [bookings, slug]);
  const upcoming = mine.filter((b) => b.status === "confirmed" && b.end >= today).sort((a, b) => (a.start < b.start ? -1 : 1));
  const past = mine.filter((b) => !(b.status === "confirmed" && b.end >= today)).sort((a, b) => (a.start < b.start ? 1 : -1));
  const unitLabel = (id: string) => property?.units.find((u) => u.id === id)?.label ?? id;

  const run = (fn: () => Promise<ActionResult<unknown>>, okText?: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setMessage(okText ? { kind: "success", text: okText } : null);
        after?.();
      } else setMessage({ kind: "error", text: res.error });
      router.refresh();
    });

  if (properties.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Add a property first, then you can record bookings for it.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Add a booking or block dates" hint="Use this when you confirm a stay on WhatsApp, or to close dates (maintenance, owner use). Those nights then show as taken on the website.">
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.length > 1 && (
            <Field label="Property">
              <CustomSelect
                value={slug}
                onChange={(v) => {
                  setSlug(v);
                  setUnit(properties.find((p) => p.slug === v)?.units[0]?.id ?? "");
                }}
                options={properties.map((p) => ({ value: p.slug, label: p.title }))}
              />
            </Field>
          )}
          <Field label="What's booked">
            <CustomSelect
              value={unit}
              onChange={setUnit}
              options={property.units.map((u) => ({ value: u.id, label: u.label }))}
            />
          </Field>
          <Field label="Check-in">
            <input type="date" className={inputCls} value={from} min={today} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Check-out" hint="The morning they leave.">
            <input type="date" className={inputCls} value={to} min={from || today} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="Guest name (optional)">
            <input className={inputCls} value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </Field>
          <Field label="Phone or email (optional)">
            <input className={inputCls} value={guestContact} onChange={(e) => setGuestContact(e.target.value)} />
          </Field>
          <Field label="Note (optional)" className="sm:col-span-2">
            <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Deposit paid, arriving late, owner use…" />
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={pending || !from || !to}
            className={btnPrimary}
            onClick={() =>
              run(
                () => createBookingAction({ propertySlug: slug, unit, start: from, end: to, guestName, guestContact, note }),
                "Added. Those dates now show as taken.",
                () => {
                  setFrom("");
                  setTo("");
                  setGuestName("");
                  setGuestContact("");
                  setNote("");
                },
              )
            }
          >
            {pending ? "Saving…" : "Add booking"}
          </button>
          {message && <Notice kind={message.kind}>{message.text}</Notice>}
        </div>
      </Card>

      <Card title="Upcoming and current">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing booked yet for {property.title}.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((b) => (
              <Row key={b._id} b={b} unitLabel={unitLabel(b.unit)} pending={pending} run={run} />
            ))}
          </ul>
        )}
      </Card>

      {past.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowPast((s) => !s)} className="text-sm text-muted-foreground underline underline-offset-4">
            {showPast ? "Hide" : "Show"} past and cancelled ({past.length})
          </button>
          {showPast && (
            <Card className="mt-4">
              <ul className="divide-y divide-border">
                {past.map((b) => (
                  <Row key={b._id} b={b} unitLabel={unitLabel(b.unit)} pending={pending} run={run} />
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  b,
  unitLabel,
  pending,
  run,
}: {
  b: BookingRow;
  unitLabel: string;
  pending: boolean;
  run: (fn: () => Promise<ActionResult<unknown>>, okText?: string) => void;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-4 text-sm">
      <div className="space-y-0.5">
        <p>
          <span className="font-medium">{formatDay(b.start)}</span> to {formatDay(b.end)}
          <span className="text-muted-foreground"> · {nightsBetween(b.start, b.end)} nights</span>
          {b.status === "cancelled" && <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Cancelled</span>}
        </p>
        <p className="text-muted-foreground">
          {unitLabel}
          {b.guestName ? ` · ${b.guestName}` : ""}
        </p>
        {b.guestContact && (
          <p className="text-muted-foreground">
            {looksLikePhone(b.guestContact) ? (
              <a href={waLink(b.guestContact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-4">
                <WhatsAppIcon className="h-3.5 w-3.5" /> {b.guestContact}
              </a>
            ) : (
              b.guestContact
            )}
          </p>
        )}
        {b.note && <p className="text-muted-foreground">{b.note}</p>}
      </div>
      <div className="flex gap-2">
        {b.status === "confirmed" && (
          <button
            type="button"
            disabled={pending}
            className={btnSmall}
            onClick={() => window.confirm("Cancel this booking? The dates will be free again.") && run(() => cancelBookingAction(b._id), "Cancelled. The dates are free again.")}
          >
            <Ban className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          aria-label="Delete booking"
          className={btnSmall}
          onClick={() => window.confirm("Delete this record for good?") && run(() => deleteBookingAction(b._id), "Deleted.")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
