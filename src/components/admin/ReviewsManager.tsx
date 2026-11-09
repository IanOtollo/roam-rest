"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, EyeOff, Trash2 } from "lucide-react";
import {
  createInviteAction,
  deleteReviewAction,
  revokeInviteAction,
  setReviewStatusAction,
  type ActionResult,
} from "@/app/admin/actions";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { brand } from "@/lib/property";
import { Stars } from "@/components/ui/Stars";
import { btnPrimary, btnSecondary, btnSmall, Card, Field, inputCls, Notice } from "./ui";

type PropertyLite = { slug: string; title: string; units: { id: string; label: string }[] };
type ReviewRow = {
  _id: string;
  propertySlug: string;
  author: string;
  quote: string;
  stayed: string;
  nights: number;
  unit: string;
  rating?: number;
  status: "pending" | "published" | "hidden";
};
type InviteRow = { id: string; propertySlug: string; unit: string; stayed: string; guestName?: string };

const monthLabel = (value: string) => {
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

export function ReviewsManager({
  properties,
  reviews,
  invites,
}: {
  properties: PropertyLite[];
  reviews: ReviewRow[];
  invites: InviteRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [slug, setSlug] = useState(properties[0]?.slug ?? "");
  const property = properties.find((p) => p.slug === slug) ?? properties[0];
  const [unit, setUnit] = useState(property?.units[0]?.id ?? "");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [nights, setNights] = useState("2");
  const [guest, setGuest] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const titleOf = (s: string) => properties.find((p) => p.slug === s)?.title ?? s;
  const unitOf = (s: string, id: string) => properties.find((p) => p.slug === s)?.units.find((u) => u.id === id)?.label ?? id;

  const run = (fn: () => Promise<ActionResult<unknown>>) =>
    start(async () => {
      const res = await fn();
      setMessage(res.ok ? null : { kind: "error", text: res.error });
      router.refresh();
    });

  async function makeLink() {
    setMessage(null);
    setLink(null);
    start(async () => {
      const res = await createInviteAction({
        propertySlug: slug,
        unit,
        nights: Number(nights) || 1,
        stayed: monthLabel(month),
        guestName: guest.trim() || undefined,
      });
      if (!res.ok) return setMessage({ kind: "error", text: res.error });
      setLink(`${window.location.origin}${res.data!.path}`);
      router.refresh();
    });
  }

  const shareText = (url: string) =>
    `Hello${guest.trim() ? ` ${guest.trim()}` : ""}! Thank you for staying at ${titleOf(slug)} with ${brand.name}. We'd love to hear how it was. You can leave a short review here: ${url}`;

  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const published = reviews.filter((r) => r.status === "published");
  const hidden = reviews.filter((r) => r.status === "hidden");

  if (properties.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Add a property first, then you can ask guests for reviews.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Ask a guest for a review" hint="After checkout, create a personal one-time link and send it to the guest. Only people who stayed can review.">
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
          <Field label="What they stayed in">
            <CustomSelect
              value={unit}
              onChange={setUnit}
              options={property.units.map((u) => ({ value: u.id, label: u.label }))}
            />
          </Field>
          <Field label="Month of the stay">
            <input type="month" className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)} />
          </Field>
          <Field label="Nights">
            <input type="number" min={1} className={inputCls} value={nights} onChange={(e) => setNights(e.target.value)} />
          </Field>
          <Field label="Guest's first name (optional)" className="sm:col-span-2">
            <input className={inputCls} value={guest} onChange={(e) => setGuest(e.target.value)} />
          </Field>
        </div>
        <button type="button" disabled={pending} onClick={makeLink} className={`${btnPrimary} mt-5`}>
          {pending ? "Creating…" : "Create review link"}
        </button>

        {link && (
          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium">Send this link to the guest. It works once and expires in 7 days.</p>
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={inputCls} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
              </button>
              <a
                className={btnSecondary}
                href={`https://wa.me/?text=${encodeURIComponent(shareText(link))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
              </a>
            </div>
          </div>
        )}
        {message && (
          <div className="mt-4">
            <Notice kind={message.kind}>{message.text}</Notice>
          </div>
        )}
      </Card>

      <Card title={`Waiting for your approval (${pendingReviews.length})`}>
        {pendingReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting. New reviews appear here first. You decide what goes live.</p>
        ) : (
          <ul className="space-y-4">
            {pendingReviews.map((r) => (
              <ReviewItem key={r._id} r={r} title={titleOf(r.propertySlug)} unitLabel={unitOf(r.propertySlug, r.unit)} pending={pending} run={run} />
            ))}
          </ul>
        )}
      </Card>

      {published.length > 0 && (
        <Card title={`Live on the website (${published.length})`}>
          <ul className="space-y-4">
            {published.map((r) => (
              <ReviewItem key={r._id} r={r} title={titleOf(r.propertySlug)} unitLabel={unitOf(r.propertySlug, r.unit)} pending={pending} run={run} />
            ))}
          </ul>
        </Card>
      )}

      {hidden.length > 0 && (
        <Card title={`Hidden (${hidden.length})`}>
          <ul className="space-y-4">
            {hidden.map((r) => (
              <ReviewItem key={r._id} r={r} title={titleOf(r.propertySlug)} unitLabel={unitOf(r.propertySlug, r.unit)} pending={pending} run={run} />
            ))}
          </ul>
        </Card>
      )}

      {invites.length > 0 && (
        <Card title={`Links sent, not yet used (${invites.length})`}>
          <ul className="divide-y divide-border text-sm">
            {invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  {titleOf(i.propertySlug)} · {unitOf(i.propertySlug, i.unit)} · {i.stayed}
                  {i.guestName ? ` · ${i.guestName}` : ""}
                </span>
                <button type="button" disabled={pending} className={btnSmall} onClick={() => run(() => revokeInviteAction(i.id))}>
                  Cancel link
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ReviewItem({
  r,
  title,
  unitLabel,
  pending,
  run,
}: {
  r: ReviewRow;
  title: string;
  unitLabel: string;
  pending: boolean;
  run: (fn: () => Promise<ActionResult<unknown>>) => void;
}) {
  return (
    <li className="rounded-2xl border border-border/60 p-4">
      <p className="font-serif text-lg leading-snug tracking-tight">&ldquo;{r.quote}&rdquo;</p>
      {r.rating ? <Stars value={r.rating} className="mb-2" /> : null}
      <p className="mt-3 text-sm">{r.author}</p>
      <p className="text-xs text-muted-foreground">
        {title} · {unitLabel} · Stayed {r.stayed} · {r.nights} nights
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {r.status !== "published" && (
          <button type="button" disabled={pending} className={btnSmall} onClick={() => run(() => setReviewStatusAction(r._id, "published"))}>
            <Check className="h-3.5 w-3.5" /> Publish
          </button>
        )}
        {r.status !== "hidden" && (
          <button type="button" disabled={pending} className={btnSmall} onClick={() => run(() => setReviewStatusAction(r._id, "hidden"))}>
            <EyeOff className="h-3.5 w-3.5" /> {r.status === "published" ? "Hide" : "Decline"}
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          aria-label="Delete review"
          className={btnSmall}
          onClick={() => window.confirm("Delete this review for good?") && run(() => deleteReviewAction(r._id))}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
