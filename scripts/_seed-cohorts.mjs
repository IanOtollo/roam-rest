// One-off: clears Karen's placeholder rates and adds the five new properties (unpublished).
import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const secret = env.ADMIN_API_SECRET;
const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

const FIELDS = ["slug","title","tagline","area","city","locationNote","locationBlurb","maxGuests","minNights","checkIn","checkOut","highlights","units","amenities","walkthrough","heroImages","cover"];

// ---- Karen: remove the pricing -------------------------------------------------------------
const karen = await client.query("properties:adminGet", { secret, slug: "karen-estate" });
if (karen) {
  const input = Object.fromEntries(FIELDS.map((k) => [k, karen.property[k]]));
  input.units = input.units.map((u) => ({ ...u, nightlyRate: 0 }));
  await client.mutation("properties:upsert", { secret, property: input });
  console.log("karen-estate: rates cleared");
}

// ---- helpers -------------------------------------------------------------------------------
const A = {
  wifi: (d = "Throughout the property") => ({ key: "wifi", icon: "wifi", label: "WiFi", detail: d }),
  kitchen: (d = "Fully equipped") => ({ key: "kitchen", icon: "kitchen", label: "Kitchen", detail: d }),
  parking: (d = "On the premises") => ({ key: "parking", icon: "car", label: "Free parking", detail: d }),
  cctv: (d = "Exterior security cameras") => ({ key: "cctv", icon: "camera", label: "CCTV on the grounds", detail: d }),
  pool: (d) => ({ key: "pool", icon: "pool", label: "Pool", detail: d }),
  terrace: (d) => ({ key: "terrace", icon: "sun", label: "Terrace or patio", detail: d }),
  workspace: (d = "A dedicated work area") => ({ key: "workspace", icon: "laptop", label: "Workspace", detail: d }),
  ensuite: (d) => ({ key: "ensuite", icon: "bed", label: "All rooms en-suite", detail: d }),
  bathtub: (d) => ({ key: "bathtub", icon: "bath", label: "Bathtub", detail: d }),
  sauna: (d) => ({ key: "sauna", icon: "flame", label: "Sauna", detail: d }),
  plunge: (d) => ({ key: "plunge-pool", icon: "waves", label: "Plunge pool", detail: d }),
  outKitchen: (d) => ({ key: "outdoor-kitchen", icon: "cooking", label: "Outdoor kitchen", detail: d }),
  outShower: (d) => ({ key: "outdoor-shower", icon: "shower", label: "Outdoor shower", detail: d }),
  wildlife: (d) => ({ key: "wildlife", icon: "paw", label: "Wildlife nearby", detail: d }),
  mountain: (d) => ({ key: "mountain-view", icon: "mountain", label: "Mountain view", detail: d }),
  chef: (d) => ({ key: "custom-chef-included", icon: "utensils", label: "Chef included", detail: d }),
  clock: () => ({ key: "clock", icon: "clock", label: "Check-in 14:00", detail: "Check-out by 10:00" }),
};

function build({ slug, title, tagline, area, city, blurb, note, guests, bedrooms, beds, baths, unitNote, highlights, amenities, photos, hero, cover }) {
  const src = (n) => `/images/${slug}/${String(n).padStart(2, "0")}.jpg`;
  const walkthrough = photos.map(([n, t, where]) => ({ src: src(n), title: t, where }));
  const h = (n, alt) => ({ src: src(n), alt });
  return {
    slug, title, tagline, area, city,
    locationNote: note ?? "The exact address is shared once your booking is confirmed.",
    locationBlurb: blurb,
    maxGuests: guests, minNights: 2, checkIn: "14:00", checkOut: "10:00",
    highlights,
    units: [{ id: "main", label: title, tab: "Entire", covers: ["main"], bedrooms, beds, bathrooms: baths, maxGuests: guests, nightlyRate: 0, note: unitNote, cover: src(cover) }],
    amenities: [...amenities, A.clock()],
    walkthrough,
    heroImages: { back: h(...hero.back), main: h(...hero.main), front: h(...hero.front) },
    cover: src(cover),
  };
}

// ---- the five properties -------------------------------------------------------------------
const props = [
  build({
    slug: "nanyuki-a-frame", title: "The A-Frame Cabin", tagline: "A-frame living in the shadow of Mount Kenya.",
    area: "Near Mount Kenya", city: "Nanyuki",
    blurb: "Just outside Nanyuki, close to Mount Kenya, with a pool and outdoor living space.",
    guests: 6, bedrooms: 3, beds: 3, baths: 3,
    unitNote: "An A-frame cabin with three bedrooms, a pool and space to live outdoors.",
    highlights: ["A-frame cabin", "Swimming pool"],
    amenities: [A.wifi(), A.kitchen(), A.parking(), A.cctv(), A.pool("For guests of the cabin"), A.terrace("Furnished for outdoor living")],
    photos: [[4, "The A-frame", "Outside"], [11, "Cabin and pool", "Outside"], [2, "The pool at night", "Outside"], [8, "The pool pavilion", "Outside"],
      [1, "The open living area", "Inside"], [3, "The lounge", "Inside"], [6, "The television corner", "Inside"], [10, "The dining room", "Inside"],
      [9, "The bedroom", "Bedrooms"], [5, "The loft bedroom", "Bedrooms"], [7, "The bathroom", "Bedrooms"]],
    hero: { back: [8, "The pool pavilion"], main: [4, "The A-frame cabin"], front: [9, "A bedroom under the A-frame"] },
    cover: 4,
  }),
  build({
    slug: "ngong-ridge-house", title: "The Ridge House", tagline: "Wide views, a long pool and a chef at your table.",
    area: "Olmaroroi", city: "Ngong",
    blurb: "In Olmaroroi, Ngong, with a pool, a dedicated workspace and free parking on the property.",
    note: "The pin location is shared once you book.",
    guests: 8, bedrooms: 4, beds: 5, baths: 4,
    unitNote: "Four en-suite bedrooms, a pool and a chef included in the rate.",
    highlights: ["Chef included", "Swimming pool"],
    amenities: [A.wifi(), A.kitchen(), A.pool("For guests of the house"), A.ensuite("All four bedrooms have their own bathroom"),
      A.chef("The nightly rate includes a chef"), A.workspace(), A.cctv(), A.parking()],
    photos: [[26, "The house and pool", "Outside"], [27, "The lap pool", "Outside"], [8, "The garden and fire pit", "Outside"], [19, "The balcony", "Outside"],
      [9, "The terrace table", "Outside"], [24, "The living room", "Inside"], [23, "Kitchen and dining", "Inside"], [29, "The dining table", "Inside"],
      [4, "The staircase", "Inside"], [34, "The work corner", "Inside"], [5, "The main bedroom", "Bedrooms"], [14, "A bedroom with a view", "Bedrooms"],
      [6, "The warm bedroom", "Bedrooms"], [11, "A guest bedroom", "Bedrooms"], [1, "The twin room", "Bedrooms"], [33, "The bathroom", "Bedrooms"]],
    hero: { back: [27, "The lap pool"], main: [26, "The house and its pool"], front: [24, "The living room"] },
    cover: 26,
  }),
  build({
    slug: "naromoru-a-frame", title: "The Naromoru A-Frame", tagline: "A quiet A-frame with its own outdoor kitchen.",
    area: "Naromoru", city: "Nanyuki",
    blurb: "In Naromoru, Nanyuki county, with an outdoor kitchen, a shared pool and a sauna.",
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    unitNote: "A one-bedroom A-frame for two, with an outdoor kitchen and a sauna.",
    highlights: ["A-frame", "Sauna"],
    amenities: [A.outKitchen("Covered, with a sink and counter"), A.pool("Shared with other guests"), A.sauna("On the property")],
    photos: [[5, "The A-frame", "Outside"], [1, "From the deck", "Outside"], [8, "The garden", "Outside"], [2, "The outdoor kitchen", "Outside"],
      [12, "The bedroom", "Bedroom"], [3, "Bedroom and bathroom", "Bedroom"], [6, "The bathroom", "Bedroom"], [18, "The pool terrace", "Shared areas"],
      [21, "The shared pool", "Shared areas"], [19, "Shade by the pool", "Shared areas"], [20, "The sauna", "Shared areas"]],
    hero: { back: [21, "The shared pool"], main: [5, "The A-frame"], front: [12, "The bedroom"] },
    cover: 5,
  }),
  build({
    slug: "bushtop", title: "Bushtop", tagline: "A magical tree house hangout spot.",
    area: "Naromoru", city: "Nanyuki",
    blurb: "In Naromoru, Nanyuki county, among the trees, with a sauna, a plunge pool and a shared pool.",
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    unitNote: "A thatched tree house for two, with a sauna and plunge pool.",
    highlights: ["Tree house", "Sauna and plunge pool"],
    amenities: [A.wifi(), A.kitchen(), A.parking(), A.sauna("Sauna and plunge pool"), A.plunge("Beside the sauna"), A.pool("Shared with other guests")],
    photos: [[2, "The tree house", "Outside"], [22, "Up in the trees", "Outside"], [11, "The walkway", "Outside"], [23, "The deck", "Outside"],
      [7, "The canopy bed", "Inside"], [6, "The bedroom", "Inside"], [12, "The sitting nook", "Inside"], [14, "The kitchenette", "Inside"],
      [20, "The breakfast table", "Inside"], [3, "The bathroom", "Inside"], [21, "The sauna", "Outside"]],
    hero: { back: [22, "The tree house in the trees"], main: [2, "Bushtop"], front: [7, "The canopy bed"] },
    cover: 2,
  }),
  build({
    slug: "naromoru-safari-cabin", title: "The Safari Cabin", tagline: "Wildlife right outside your cabin.",
    area: "Naromoru", city: "Nanyuki",
    blurb: "In Naromoru, Nanyuki, with wildlife close by and Mount Kenya on the horizon.",
    guests: 4, bedrooms: 2, beds: 2, baths: 2,
    unitNote: "Two en-suite bedrooms and an outdoor bed, with wildlife outside the door.",
    highlights: ["Wildlife nearby", "Outdoor shower"],
    amenities: [A.wifi(), A.kitchen(), A.parking(), A.ensuite("Both bedrooms have their own bathroom"), A.bathtub("Bath tubs in the bathrooms"),
      A.outShower("Open to the sky"), A.wildlife("Right outside your cabin"), A.mountain("Mount Kenya from the property")],
    photos: [[1, "Wildlife at the door", "Outside"], [7, "The cabin", "Outside"], [5, "Mount Kenya", "Outside"], [2, "The cabin at dusk", "Outside"],
      [9, "The cabin at night", "Outside"], [8, "The fire pit", "Outside"], [3, "The bedroom", "Bedrooms"], [10, "The second bedroom", "Bedrooms"],
      [6, "The veranda", "Outside"], [4, "The bath", "Bedrooms"]],
    hero: { back: [5, "Mount Kenya behind the cabin"], main: [1, "Warthogs outside the cabin"], front: [3, "The bedroom"] },
    cover: 1,
  }),
];

for (const p of props) {
  const r = await client.mutation("properties:upsert", { secret, property: p });
  console.log(p.slug, r.created ? "created" : "updated", `(${p.walkthrough.length} photos)`);
}
const list = await client.query("properties:adminList", { secret });
console.log(list.map((p) => `${p.sortOrder}. ${p.slug} ${p.published ? "published" : "draft"}`).join("\n"));
