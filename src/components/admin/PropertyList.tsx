"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
  deletePropertyAction,
  importStarterAction,
  moveAction,
  setPublishedAction,
  type ActionResult,
} from "@/app/admin/actions";
import { btnPrimary, btnSmall, Card, Notice } from "./ui";

type Item = {
  slug: string;
  title: string;
  area: string;
  published: boolean;
  coverUrl: string;
  options: number;
};

export function PropertyList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const run = (fn: () => Promise<ActionResult<unknown>>, okText?: string) =>
    start(async () => {
      const res = await fn();
      setMessage(res.ok ? (okText ? { kind: "success", text: okText } : null) : { kind: "error", text: res.error });
      router.refresh();
    });

  if (items.length === 0) {
    return (
      <Card title="Start with the property that's already designed">
        <p className="text-sm text-muted-foreground">
          The site already includes The Karen Estate with its photos, rooms and rates. Copy it into the database in one click, then edit anything,
          or add a brand-new property instead.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(importStarterAction, "Imported. You can edit it now.")}
            className={btnPrimary}
          >
            {pending ? "Importing…" : "Import The Karen Estate"}
          </button>
          <Link href="/admin/properties/new" className="inline-flex items-center rounded-xl border border-border px-5 py-3 text-sm hover:bg-muted">
            Add a new property
          </Link>
        </div>
        {message && <div className="mt-4"><Notice kind={message.kind}>{message.text}</Notice></div>}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      {items.map((p, i) => (
        <div key={p.slug} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.coverUrl} alt="" className="h-20 w-24 shrink-0 rounded-xl bg-muted object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg tracking-tight">{p.title}</p>
            <p className="text-sm text-muted-foreground">
              {p.area} · {p.options} {p.options === 1 ? "option" : "options"}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${
                p.published ? "bg-muted text-foreground" : "border border-border text-muted-foreground"
              }`}
            >
              {p.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {p.published ? "Live on the site" : "Hidden (draft)"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Move up" disabled={pending || i === 0} onClick={() => run(() => moveAction(p.slug, "up"))} className={btnSmall}>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={pending || i === items.length - 1}
              onClick={() => run(() => moveAction(p.slug, "down"))}
              className={btnSmall}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setPublishedAction(p.slug, !p.published))}
              className={btnSmall}
            >
              {p.published ? "Hide" : "Publish"}
            </button>
            <Link href={`/admin/properties/${p.slug}`} className={btnSmall}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Delete "${p.title}" for good, with its bookings and reviews? This can't be undone.`)) {
                  run(() => deletePropertyAction(p.slug), "Deleted.");
                }
              }}
              className={btnSmall}
              aria-label={`Delete ${p.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
