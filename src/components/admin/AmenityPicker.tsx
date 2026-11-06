"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  AMENITY_CATALOG,
  AMENITY_CATEGORIES,
  amenityKey,
  CLOCK_KEY,
  customKey,
  type StoredAmenity,
} from "@/lib/amenities";
import { CUSTOM_ICON_CHOICES, getAmenityIcon } from "@/lib/amenityIcons";
import { cn } from "@/lib/utils";
import { btnSecondary, btnSmall, Field, inputCls } from "./ui";

/**
 * Pick what a property offers from the full catalog (grouped by category, searchable), then
 * adjust the detail line of each, or add a custom amenity that isn't in the catalog. Whatever is
 * chosen shows on the stay page with its icon and becomes a search filter automatically.
 */
export function AmenityPicker({
  value,
  onChange,
}: {
  value: StoredAmenity[];
  onChange: (next: StoredAmenity[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({ Essentials: true, "Outdoors & leisure": true });
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [icon, setIcon] = useState("sparkles");

  const chosen = useMemo(() => new Set(value.map(amenityKey)), [value]);
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      AMENITY_CATEGORIES.map((category) => ({
        category,
        items: AMENITY_CATALOG.filter(
          (a) => a.category === category && (!q || a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)),
        ),
      })).filter((g) => g.items.length > 0),
    [q],
  );

  const toggle = (key: string) => {
    const item = AMENITY_CATALOG.find((a) => a.key === key);
    if (!item) return;
    if (chosen.has(key)) onChange(value.filter((a) => amenityKey(a) !== key));
    else onChange([...value, { key: item.key, icon: item.icon, label: item.label, detail: item.hint }]);
  };

  const update = (key: string, patch: Partial<StoredAmenity>) =>
    onChange(value.map((a) => (amenityKey(a) === key ? { ...a, ...patch } : a)));

  const addCustom = () => {
    const name = label.trim();
    if (!name) return;
    let key = customKey(name);
    if (chosen.has(key)) key = `${key}-${value.length + 1}`;
    onChange([...value, { key, icon, label: name, detail: detail.trim() }]);
    setLabel("");
    setDetail("");
    setIcon("sparkles");
  };

  const isCustom = (a: StoredAmenity) => amenityKey(a).startsWith("custom-");

  return (
    <div className="space-y-8">
      {/* Search + catalog */}
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={cn(inputCls, "pl-11")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search amenities: pool, air conditioning, generator…"
            aria-label="Search amenities"
          />
        </div>

        <div className="mt-5 space-y-3">
          {groups.length === 0 && <p className="text-sm text-muted-foreground">No match. You can add it as your own amenity below.</p>}
          {groups.map(({ category, items }) => {
            const expanded = !!q || !!open[category];
            const picked = items.filter((i) => chosen.has(i.key)).length;
            return (
              <section key={category} className="rounded-2xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [category]: !o[category] }))}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {picked > 0 ? `${picked} chosen · ` : ""}
                    {items.length} {expanded ? "" : "· tap to open"}
                  </span>
                </button>
                {expanded && (
                  <div className="flex flex-wrap gap-2 border-t border-border/60 p-4">
                    {items.map((a) => {
                      const on = chosen.has(a.key);
                      const Icon = getAmenityIcon(a.icon);
                      return (
                        <button
                          key={a.key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(a.key)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors active:scale-[0.98]",
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                          )}
                        >
                          {on ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* What's been chosen */}
      <div>
        <h3 className="font-serif text-lg tracking-tight">Chosen for this property ({value.length})</h3>
        {value.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet. Tick amenities above, or add your own below.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {value.map((a) => {
              const key = amenityKey(a);
              const Icon = getAmenityIcon(a.icon);
              const auto = key === CLOCK_KEY;
              return (
                <li key={key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 p-3 sm:flex-nowrap">
                  <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
                  {isCustom(a) ? (
                    <input
                      aria-label="Amenity name"
                      className={cn(inputCls, "py-2 sm:w-48 sm:flex-none")}
                      value={a.label}
                      onChange={(e) => update(key, { label: e.target.value })}
                    />
                  ) : (
                    <span className="min-w-0 text-sm font-medium sm:w-48 sm:flex-none">{a.label}</span>
                  )}
                  {auto ? (
                    <span className="min-w-0 flex-1 text-sm text-muted-foreground">Shows this property&apos;s check-in and check-out times</span>
                  ) : (
                    <input
                      aria-label={`${a.label} detail`}
                      className={cn(inputCls, "min-w-0 flex-1 py-2")}
                      value={a.detail}
                      onChange={(e) => update(key, { detail: e.target.value })}
                      placeholder="A short note, like “Throughout the property”"
                    />
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${a.label}`}
                    onClick={() => onChange(value.filter((x) => amenityKey(x) !== key))}
                    className={btnSmall}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Custom amenity */}
      <div className="rounded-2xl border border-dashed border-border p-4 sm:p-5">
        <h3 className="font-serif text-lg tracking-tight">Add your own</h3>
        <p className="mt-1 text-sm text-muted-foreground">Something special that isn&apos;t in the list? Add it here.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_12rem]">
          <Field label="Name">
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Private chapel" />
          </Field>
          <Field label="Short note (optional)">
            <input className={inputCls} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Seats ten guests" />
          </Field>
          <Field label="Icon">
            <CustomSelect
              value={icon}
              onChange={setIcon}
              options={CUSTOM_ICON_CHOICES.map((c) => {
                const Icon = getAmenityIcon(c.key);
                return { value: c.key, label: c.label, icon: <Icon className="h-4 w-4" /> };
              })}
            />
          </Field>
        </div>
        <button type="button" onClick={addCustom} disabled={!label.trim()} className={cn(btnSecondary, "mt-4")}>
          <Plus className="h-4 w-4" /> Add amenity
        </button>
      </div>
    </div>
  );
}
