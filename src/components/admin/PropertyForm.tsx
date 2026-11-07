"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { renamePropertyAction, savePropertyAction, uploadUrlAction } from "@/app/admin/actions";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { amenityKey, CLOCK_KEY } from "@/lib/amenities";
import { AmenityPicker } from "./AmenityPicker";
import { btnPrimary, btnSecondary, btnSmall, Card, Field, inputCls, Notice } from "./ui";

type Stored = Doc<"properties">;
export type FormState = Omit<Stored, "_id" | "_creationTime" | "published" | "sortOrder" | "updatedAt" | "previousSlugs">;
type Unit = FormState["units"][number];
type Room = FormState["walkthrough"][number];

export const blankProperty: FormState = {
  slug: "",
  title: "",
  tagline: "",
  area: "",
  city: "Nairobi",
  locationNote: "The exact address is shared once your booking is confirmed.",
  locationBlurb: "",
  maxGuests: 2,
  minNights: 2,
  checkIn: "14:00",
  checkOut: "10:00",
  highlights: [],
  units: [
    {
      id: "entire",
      label: "Entire property",
      tab: "Entire",
      covers: ["main"],
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      nightlyRate: 0,
      note: "",
      cover: "",
    },
  ],
  amenities: [],
  walkthrough: [],
  heroImages: { back: { src: "", alt: "" }, main: { src: "", alt: "" }, front: { src: "", alt: "" } },
  cover: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const prettyPart = (id: string) => id.replace(/-/g, " ");
const num = (v: string) => (v === "" ? 0 : Number(v));

/** Shrinks big phone photos before upload so pages stay fast. */
async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose image files only.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process that image."))), "image/jpeg", 0.85),
  );
}

async function uploadPhoto(file: File): Promise<{ id: string; preview: string }> {
  const blob = await compress(file);
  const target = await uploadUrlAction();
  if (!target.ok) throw new Error(target.error);
  const res = await fetch(target.data!.url, { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
  if (!res.ok) throw new Error("The upload didn't go through. Please try again.");
  const { storageId } = (await res.json()) as { storageId: string };
  return { id: storageId, preview: URL.createObjectURL(blob) };
}

export function PropertyForm({
  initial,
  urls,
  isNew,
}: {
  initial: FormState;
  urls: Record<string, string>;
  isNew: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(initial);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [partsText, setPartsText] = useState(() =>
    Array.from(new Set(initial.units.flatMap((u) => u.covers))).map(prettyPart).join(", "),
  );
  const [highlightsText, setHighlightsText] = useState(initial.highlights.join(", "));
  const [busy, setBusy] = useState<"save" | "upload" | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((p) => ({ ...p, [key]: value }));
  const img = (ref: string) => previews[ref] || urls[ref] || (ref.startsWith("/") ? ref : "");
  const parts = Array.from(new Set(partsText.split(",").map((s) => slugify(s)).filter(Boolean)));

  /* ----------------------------------------------------------------- photos */

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy("upload");
    setMessage(null);
    try {
      const added: Room[] = [];
      const newPreviews: Record<string, string> = {};
      for (const file of Array.from(files)) {
        const { id, preview } = await uploadPhoto(file);
        newPreviews[id] = preview;
        added.push({ src: id, title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 40), where: "" });
      }
      setPreviews((p) => ({ ...p, ...newPreviews }));
      setF((prev) => {
        const walkthrough = [...prev.walkthrough, ...added];
        // Sensible defaults the first time photos arrive, so the owner can just press Save.
        const first = walkthrough[0]?.src ?? "";
        const pick = (i: number) => walkthrough[i % walkthrough.length]?.src ?? "";
        return {
          ...prev,
          walkthrough,
          cover: prev.cover || first,
          heroImages: {
            back: prev.heroImages.back.src ? prev.heroImages.back : { src: pick(2), alt: "" },
            main: prev.heroImages.main.src ? prev.heroImages.main : { src: pick(0), alt: "" },
            front: prev.heroImages.front.src ? prev.heroImages.front : { src: pick(1), alt: "" },
          },
          units: prev.units.map((u) => ({ ...u, cover: u.cover || first })),
        };
      });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const movePhoto = (i: number, dir: -1 | 1) =>
    setF((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.walkthrough.length) return p;
      const w = [...p.walkthrough];
      [w[i], w[j]] = [w[j], w[i]];
      return { ...p, walkthrough: w };
    });

  const removePhoto = (i: number) =>
    setF((p) => {
      const gone = p.walkthrough[i].src;
      const w = p.walkthrough.filter((_, k) => k !== i);
      const fallback = w[0]?.src ?? "";
      const keep = (s: string) => (s === gone ? fallback : s);
      return {
        ...p,
        walkthrough: w,
        cover: keep(p.cover),
        heroImages: {
          back: { ...p.heroImages.back, src: keep(p.heroImages.back.src) },
          main: { ...p.heroImages.main, src: keep(p.heroImages.main.src) },
          front: { ...p.heroImages.front, src: keep(p.heroImages.front.src) },
        },
        units: p.units.map((u) => ({ ...u, cover: keep(u.cover) })),
      };
    });

  const updatePhoto = (i: number, patch: Partial<Room>) =>
    setF((p) => ({ ...p, walkthrough: p.walkthrough.map((r, k) => (k === i ? { ...r, ...patch } : r)) }));

  /* ---------------------------------------------------------------- options */

  const updateUnit = (i: number, patch: Partial<Unit>) =>
    setF((p) => ({ ...p, units: p.units.map((u, k) => (k === i ? { ...u, ...patch } : u)) }));

  const addUnit = () =>
    setF((p) => {
      const base = slugify(`option ${p.units.length + 1}`);
      const id = p.units.some((u) => u.id === base) ? `${base}-${Date.now() % 1000}` : base;
      return {
        ...p,
        units: [
          ...p.units,
          {
            id,
            label: "",
            tab: "",
            covers: [],
            bedrooms: 1,
            beds: 1,
            bathrooms: 1,
            maxGuests: 2,
            nightlyRate: 0,
            note: "",
            cover: p.cover,
          },
        ],
      };
    });

  const toggleCover = (i: number, part: string) => {
    const u = f.units[i];
    updateUnit(i, { covers: u.covers.includes(part) ? u.covers.filter((c) => c !== part) : [...u.covers, part] });
  };

  /* ------------------------------------------------------------------- save */

  async function save() {
    setMessage(null);
    const title = f.title.trim();
    const slug = (isNew ? f.slug || slugify(title) : f.slug).trim();
    if (title.length < 2) return setMessage({ kind: "error", text: "Please give the property a name." });
    if (!f.area.trim() || !f.city.trim()) return setMessage({ kind: "error", text: "Please fill in the area and city." });
    if (f.walkthrough.length === 0) return setMessage({ kind: "error", text: "Add at least one photo." });
    for (const u of f.units) {
      if (!u.label.trim()) return setMessage({ kind: "error", text: "Every way to stay needs a name." });
      if (u.covers.length === 0) return setMessage({ kind: "error", text: `"${u.label}" must include at least one part of the property.` });
    }

    const first = f.walkthrough[0].src;
    const title0 = (src: string) => f.walkthrough.find((r) => r.src === src)?.title || title;
    const hero = (h: FormState["heroImages"]["main"]) => {
      const src = h.src || first;
      return { src, alt: title0(src) };
    };

    const amenities = f.amenities.map((a) =>
      amenityKey(a) === CLOCK_KEY
        ? { key: CLOCK_KEY, icon: "clock", label: `Check-in ${f.checkIn}`, detail: `Check-out by ${f.checkOut}` }
        : { ...a, key: amenityKey(a) },
    );

    if (!slug) return setMessage({ kind: "error", text: "Please give the property a web address." });

    setBusy("save");
    // A changed address is renamed first (bookings, reviews and links move with it), then saved.
    if (!isNew && slug !== initial.slug) {
      const renamed = await renamePropertyAction(initial.slug, slug);
      if (!renamed.ok) {
        setBusy(null);
        return setMessage({ kind: "error", text: renamed.error });
      }
    }
    const res = await savePropertyAction({
      ...f,
      title,
      slug,
      tagline: f.tagline.trim(),
      area: f.area.trim(),
      city: f.city.trim(),
      locationBlurb: f.locationBlurb.trim(),
      locationNote: f.locationNote.trim(),
      highlights: highlightsText.split(",").map((s) => s.trim()).filter(Boolean),
      cover: f.cover || first,
      heroImages: { back: hero(f.heroImages.back), main: hero(f.heroImages.main), front: hero(f.heroImages.front) },
      units: f.units.map((u) => ({ ...u, label: u.label.trim(), tab: u.tab.trim() || u.label.trim(), cover: u.cover || first })),
      amenities,
      maxGuests: Math.max(...f.units.map((u) => u.maxGuests), f.maxGuests),
    });
    setBusy(null);
    if (!res.ok) return setMessage({ kind: "error", text: res.error });
    setMessage({ kind: "success", text: "Saved. It's on the website now." });
    router.push("/admin/properties");
    router.refresh();
  }

  /* ------------------------------------------------------------------- view */

  // Custom dropdown with a small preview of each photo.
  const photoSelect = (value: string, onChange: (src: string) => void) => (
    <CustomSelect
      value={value}
      onChange={onChange}
      placeholder="Choose a photo…"
      disabled={f.walkthrough.length === 0}
      options={f.walkthrough.map((r, i) => ({
        value: r.src,
        label: `${i + 1}. ${r.title || "Untitled"}`,
        hint: r.where || undefined,
        image: img(r.src),
      }))}
    />
  );

  return (
    <div className="space-y-6">
      <Card title="The basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Property name">
            <input
              className={inputCls}
              value={f.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              placeholder="The Karen Estate"
            />
          </Field>
          <Field
            label="Web address"
            hint={
              isNew
                ? "Part of the page link. Letters, numbers and dashes."
                : f.slug !== initial.slug
                  ? `The page will move to /stays/${f.slug || "…"}. Links to the old address keep working and send visitors to the new one.`
                  : "Part of the page link. You can change it; old links will redirect to the new one."
            }
          >
            <input
              className={inputCls}
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="the-karen-estate"
            />
          </Field>
          <Field label="One-line description" className="sm:col-span-2">
            <input
              className={inputCls}
              value={f.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="A house that lives like a gallery."
            />
          </Field>
          <Field label="Area">
            <input className={inputCls} value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="Karen, Langata" />
          </Field>
          <Field label="City">
            <input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Nairobi" />
          </Field>
        </div>
      </Card>

      <Card title="Stay details">
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Minimum nights">
            <input type="number" min={1} className={inputCls} value={f.minNights} onChange={(e) => set("minNights", num(e.target.value))} />
          </Field>
          <Field label="Check-in time">
            <input type="time" className={inputCls} value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
          </Field>
          <Field label="Check-out time">
            <input type="time" className={inputCls} value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
          </Field>
          <Field label="Sleeps (most)">
            <input type="number" min={1} className={inputCls} value={f.maxGuests} onChange={(e) => set("maxGuests", num(e.target.value))} />
          </Field>
          <Field label="Highlights" hint="Short tags shown on the property, separated by commas. For example: Private pool, Garden." className="sm:col-span-4">
            <input className={inputCls} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder="Private pool" />
          </Field>
        </div>
      </Card>

      <Card title="Photos" hint="Add your photos here once. Portrait photos (taller than wide) look best. They're resized automatically.">
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
        <button type="button" disabled={busy !== null} onClick={() => fileInput.current?.click()} className={btnSecondary}>
          <ImagePlus className="h-4 w-4" /> {busy === "upload" ? "Uploading…" : "Add photos"}
        </button>

        {f.walkthrough.length > 0 && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              Visitors walk through these photos in this order. Give each a short name and say where it is.
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {f.walkthrough.map((r, i) => (
                <li key={r.src} className="flex gap-3 rounded-2xl border border-border/60 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(r.src)} alt="" className="h-28 w-20 shrink-0 rounded-xl bg-muted object-cover" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      aria-label="Photo name"
                      className={`${inputCls} py-2`}
                      value={r.title}
                      onChange={(e) => updatePhoto(i, { title: e.target.value })}
                      placeholder="The great hall"
                    />
                    <input
                      aria-label="Where it is"
                      className={`${inputCls} py-2`}
                      value={r.where}
                      onChange={(e) => updatePhoto(i, { where: e.target.value })}
                      placeholder="Main house"
                    />
                    <div className="flex gap-1.5">
                      <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => movePhoto(i, -1)} className={btnSmall}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move later"
                        disabled={i === f.walkthrough.length - 1}
                        onClick={() => movePhoto(i, 1)}
                        className={btnSmall}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label="Remove photo" onClick={() => removePhoto(i)} className={btnSmall}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label="Main photo (cards and sharing)">{photoSelect(f.cover, (src) => set("cover", src))}</Field>
              <span className="hidden sm:block" />
              <Field label="Home carousel: large photo in the middle">
                {photoSelect(f.heroImages.main.src, (src) => set("heroImages", { ...f.heroImages, main: { src, alt: "" } }))}
              </Field>
              <Field label="Home carousel: small photo, left">
                {photoSelect(f.heroImages.back.src, (src) => set("heroImages", { ...f.heroImages, back: { src, alt: "" } }))}
              </Field>
              <Field label="Home carousel: small photo, right">
                {photoSelect(f.heroImages.front.src, (src) => set("heroImages", { ...f.heroImages, front: { src, alt: "" } }))}
              </Field>
            </div>
          </>
        )}
      </Card>

      <Card
        title="Ways to stay"
        hint="What guests can book. A simple property has one option. If it can be booked in parts (for example a main house and a cottage), add parts below and give each option the parts it includes."
      >
        <Field
          label="Parts of the property"
          hint="Separate with commas. Keep 'main' for a single-unit property. Example: main house, cottage"
        >
          <input
            className={inputCls}
            value={partsText}
            onChange={(e) => {
              setPartsText(e.target.value);
              const next = Array.from(new Set(e.target.value.split(",").map((s) => slugify(s)).filter(Boolean)));
              setF((p) => ({ ...p, units: p.units.map((u) => ({ ...u, covers: u.covers.filter((c) => next.includes(c)) })) }));
            }}
          />
        </Field>

        <div className="mt-6 space-y-5">
          {f.units.map((u, i) => (
            <div key={u.id} className="rounded-2xl border border-border/60 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Option {i + 1}</p>
                {f.units.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove this option"
                    onClick={() => setF((p) => ({ ...p, units: p.units.filter((_, k) => k !== i) }))}
                    className={btnSmall}
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input className={inputCls} value={u.label} onChange={(e) => updateUnit(i, { label: e.target.value })} placeholder="The Whole Estate" />
                </Field>
                <Field label="Short name" hint="Shown on the small switch, like “Entire”.">
                  <input className={inputCls} value={u.tab} onChange={(e) => updateUnit(i, { tab: e.target.value })} placeholder="Entire" />
                </Field>
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">Includes</span>
                  <div className="flex flex-wrap gap-2">
                    {parts.length === 0 && <span className="text-sm text-muted-foreground">Add parts above first.</span>}
                    {parts.map((part) => {
                      const on = u.covers.includes(part);
                      return (
                        <button
                          key={part}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleCover(i, part)}
                          className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                          }`}
                        >
                          {prettyPart(part)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Field label="Price per night (KES)" hint="Optional. Leave empty and no price is shown for this option.">
                  <input type="number" min={0} step={500} className={inputCls} value={u.nightlyRate || ""} onChange={(e) => updateUnit(i, { nightlyRate: num(e.target.value) })} />
                </Field>
                <Field label="Most guests">
                  <input type="number" min={1} className={inputCls} value={u.maxGuests} onChange={(e) => updateUnit(i, { maxGuests: num(e.target.value) })} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" min={0} className={inputCls} value={u.bedrooms} onChange={(e) => updateUnit(i, { bedrooms: num(e.target.value) })} />
                </Field>
                <Field label="Beds">
                  <input type="number" min={0} className={inputCls} value={u.beds} onChange={(e) => updateUnit(i, { beds: num(e.target.value) })} />
                </Field>
                <Field label="Bathrooms" hint="Use .5 for a guest toilet, like 3.5.">
                  <input type="number" min={0} step={0.5} className={inputCls} value={u.bathrooms} onChange={(e) => updateUnit(i, { bathrooms: num(e.target.value) })} />
                </Field>
                <Field label="Photo">{photoSelect(u.cover, (src) => updateUnit(i, { cover: src }))}</Field>
                <Field label="Short description" className="sm:col-span-2">
                  <input className={inputCls} value={u.note} onChange={(e) => updateUnit(i, { note: e.target.value })} placeholder="A complete house of its own, with a private kitchen." />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addUnit} className={`${btnSecondary} mt-5`}>
          <Plus className="h-4 w-4" /> Add another way to stay
        </button>
      </Card>

      <Card title="What's included" hint="Tick what applies. These show on the property page and power the search filters.">
        <AmenityPicker value={f.amenities} onChange={(amenities) => setF((p) => ({ ...p, amenities }))} />
      </Card>

      <Card title="Location">
        <div className="grid gap-5">
          <Field label="About the area">
            <textarea className={`${inputCls} min-h-24`} value={f.locationBlurb} onChange={(e) => set("locationBlurb", e.target.value)} placeholder="A quiet, leafy corner of Karen-Langata, with free parking on the property." />
          </Field>
          <Field label="Note about the exact address">
            <input className={inputCls} value={f.locationNote} onChange={(e) => set("locationNote", e.target.value)} />
          </Field>
        </div>
      </Card>

      {/* Sticks to the bottom of the screen while editing, then rests above the page footer. */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-border/60 bg-background/90 backdrop-blur-md sm:-mx-6 lg:mx-0 lg:rounded-b-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">{message && <Notice kind={message.kind}>{message.text}</Notice>}</div>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/admin/properties")} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" disabled={busy !== null} onClick={save} className={btnPrimary}>
              {busy === "save" ? "Saving…" : "Save property"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
