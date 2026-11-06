/**
 * The amenity catalog: everything a stay might offer, grouped by category. The admin picks from
 * this list (or adds a custom amenity) and the website shows it with an icon and offers it as a
 * search filter automatically. To add a new standard amenity, add one line here and, if it needs
 * a new icon, one line in `amenityIcons.ts`. Nothing else changes.
 *
 * Kept free of UI imports so it can be used on the server and in the browser.
 */

export interface CatalogAmenity {
  key: string;
  label: string;
  /** Default detail line, editable per property. */
  hint: string;
  category: string;
  /** Key into the icon registry (`amenityIcons.ts`). */
  icon: string;
}

export const AMENITY_CATEGORIES = [
  "Essentials",
  "Kitchen & dining",
  "Bedrooms & bathrooms",
  "Outdoors & leisure",
  "Parking & access",
  "Safety & security",
  "Family & pets",
  "Services",
  "Views & surroundings",
  "Entertainment & work",
] as const;

const c = (category: string, key: string, label: string, hint: string, icon = key): CatalogAmenity => ({
  key,
  label,
  hint,
  category,
  icon,
});

export const AMENITY_CATALOG: CatalogAmenity[] = [
  // Essentials
  c("Essentials", "wifi", "WiFi", "Throughout the property"),
  c("Essentials", "ac", "Air conditioning", "In the main living areas and bedrooms"),
  c("Essentials", "heating", "Heating", "For cooler evenings"),
  c("Essentials", "hot-water", "Hot water", "In every bathroom", "shower"),
  c("Essentials", "fireplace", "Fireplace", "Firewood on request", "flame"),
  c("Essentials", "ceiling-fans", "Ceiling fans", "In the bedrooms and living areas", "fan"),
  c("Essentials", "mosquito-nets", "Mosquito nets", "Over the beds", "bed"),
  c("Essentials", "towels", "Towels & linen", "Fresh linen and towels provided", "shirt"),
  c("Essentials", "toiletries", "Toiletries", "Soap and shampoo provided", "bath"),
  c("Essentials", "washer", "Washing machine", "Available to guests", "washer"),
  c("Essentials", "dryer", "Dryer", "Available to guests", "wind"),
  c("Essentials", "iron", "Iron", "Iron and board provided", "shirt"),
  c("Essentials", "hair-dryer", "Hair dryer", "In the bathrooms", "wind"),
  c("Essentials", "clock", "Check-in and check-out times", "Shown automatically from the times above"),

  // Kitchen & dining
  c("Kitchen & dining", "kitchen", "Kitchen", "Fully equipped", "cooking"),
  c("Kitchen & dining", "coffee", "Coffee machine", "Coffee and tea making"),
  c("Kitchen & dining", "microwave", "Microwave", "In the kitchen"),
  c("Kitchen & dining", "oven", "Oven and hob", "Gas or electric", "cooking"),
  c("Kitchen & dining", "fridge", "Fridge and freezer", "Full-size", "fridge"),
  c("Kitchen & dining", "dishwasher", "Dishwasher", "In the kitchen", "utensils"),
  c("Kitchen & dining", "cookware", "Cookware and utensils", "Pots, pans, plates and glasses", "utensils"),
  c("Kitchen & dining", "dining", "Dining area", "Table for the whole group", "utensils"),

  // Bedrooms & bathrooms
  c("Bedrooms & bathrooms", "ensuite", "All rooms en-suite", "Every bedroom has its own bathroom", "bed"),
  c("Bedrooms & bathrooms", "extra-beds", "Extra beds on request", "Ask the host", "bed"),
  c("Bedrooms & bathrooms", "bathtub", "Bathtub", "In the main bathroom", "bath"),
  c("Bedrooms & bathrooms", "wardrobe", "Wardrobe space", "Hangers and storage", "shirt"),

  // Outdoors & leisure
  c("Outdoors & leisure", "pool", "Pool", "Private, set in the courtyard", "waves"),
  c("Outdoors & leisure", "garden", "Garden", "Landscaped and private", "trees"),
  c("Outdoors & leisure", "terrace", "Terrace or patio", "Furnished for outdoor living", "sun"),
  c("Outdoors & leisure", "balcony", "Balcony", "With seating", "sun"),
  c("Outdoors & leisure", "bbq", "BBQ or braai area", "Grill and seating", "flame"),
  c("Outdoors & leisure", "outdoor-dining", "Outdoor dining", "Table and chairs", "utensils"),
  c("Outdoors & leisure", "hot-tub", "Hot tub", "Private", "bath"),
  c("Outdoors & leisure", "gym", "Gym", "Basic equipment", "dumbbell"),
  c("Outdoors & leisure", "fire-pit", "Fire pit", "For evenings outside", "flame"),
  c("Outdoors & leisure", "sun-loungers", "Sun loungers", "By the pool", "sun"),

  // Parking & access
  c("Parking & access", "parking", "Free parking", "On the premises", "car"),
  c("Parking & access", "secure-parking", "Secure parking", "Inside the compound", "car"),
  c("Parking & access", "gated", "Gated compound", "Private and enclosed", "key"),
  c("Parking & access", "step-free", "Step-free access", "No steps to the entrance", "accessibility"),
  c("Parking & access", "ev-charger", "EV charger", "On the premises", "zap"),
  c("Parking & access", "self-checkin", "Self check-in", "With a code or key box", "key"),
  c("Parking & access", "lift", "Lift", "To all floors", "building"),

  // Safety & security
  c("Safety & security", "security-guard", "Security guard", "On duty", "shield"),
  c("Safety & security", "cctv", "CCTV on the grounds", "Outdoor areas only", "camera"),
  c("Safety & security", "electric-fence", "Electric fence", "Around the compound", "shield"),
  c("Safety & security", "alarm", "Alarm system", "Linked to a response team", "shield"),
  c("Safety & security", "smoke-alarm", "Smoke alarm", "In the main areas", "bell"),
  c("Safety & security", "fire-extinguisher", "Fire extinguisher", "In the kitchen", "extinguisher"),
  c("Safety & security", "first-aid", "First-aid kit", "In the kitchen", "firstaid"),
  c("Safety & security", "safe", "Safe", "For valuables", "key"),
  c("Safety & security", "generator", "Backup power", "Generator or inverter", "zap"),
  c("Safety & security", "water-tank", "Water storage", "Tank or borehole", "droplets"),

  // Family & pets
  c("Family & pets", "cot", "Cot available", "On request", "baby"),
  c("Family & pets", "high-chair", "High chair", "On request", "baby"),
  c("Family & pets", "child-friendly", "Child-friendly", "Welcoming to children", "baby"),
  c("Family & pets", "pets", "Pets welcome", "Please ask first", "paw"),

  // Services
  c("Services", "housekeeping", "Housekeeping", "Included or on request", "sparkles"),
  c("Services", "breakfast", "Breakfast", "Included or on request", "coffee"),
  c("Services", "airport-transfer", "Airport transfer", "Arranged on request", "plane"),
  c("Services", "chef", "Chef on request", "Meals prepared to order", "utensils"),
  c("Services", "laundry-service", "Laundry service", "On request", "shirt"),
  c("Services", "host-on-call", "Host on call", "Reachable throughout your stay", "phone"),

  // Views & surroundings
  c("Views & surroundings", "mountain-view", "Mountain view", "From the property", "mountain"),
  c("Views & surroundings", "garden-view", "Garden view", "From the main rooms", "trees"),
  c("Views & surroundings", "pool-view", "Pool view", "From the main rooms", "waves"),
  c("Views & surroundings", "quiet", "Quiet neighbourhood", "Peaceful and leafy", "trees"),

  // Entertainment & work
  c("Entertainment & work", "tv", "TV", "With satellite or streaming"),
  c("Entertainment & work", "streaming", "Streaming", "Bring your own account", "tv"),
  c("Entertainment & work", "workspace", "Workspace", "A desk and a good chair", "laptop"),
  c("Entertainment & work", "board-games", "Board games", "For the whole group", "gamepad"),
  c("Entertainment & work", "sound-system", "Sound system", "Bluetooth speaker", "music"),
  c("Entertainment & work", "books", "Books", "A small library", "book"),
  c("Entertainment & work", "art", "Original artwork", "Displayed throughout the home", "palette"),
];

export const catalogByKey = new Map(AMENITY_CATALOG.map((a) => [a.key, a]));

/** What an amenity looks like once saved on a property. */
export interface StoredAmenity {
  /** Catalog key, or `custom-…` for one the owner added. Older records have only `icon`. */
  key?: string;
  icon: string;
  label: string;
  detail: string;
}

/** Stable identity of a saved amenity (used by search filters and the admin picker). */
export const amenityKey = (a: { key?: string; icon: string }) => a.key ?? a.icon;

export const customKey = (label: string) =>
  `custom-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)}`;

/** Amenities with this key show the property's own check-in and check-out times. */
export const CLOCK_KEY = "clock";
