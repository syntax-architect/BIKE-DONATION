// ── The People's Apache RR310 — shared domain constants ──────────────────────

export type ZoneId = "BELLY" | "FAIRING" | "TANK" | "WINGLETS" | "COWL";
export type ClaimMode = "SOLO" | "COUPLE" | "PROMO";

export interface ZoneConfig {
  id: ZoneId;
  label: string;
  short: string;
  tierName: string;
  price: number;
  capacity: number;
  color: string;
  print: string;
  desc: string;
  /** hotspot marker position inside the 920×545 SVG viewBox */
  marker: { x: number; y: number };
  /** floating label anchor (percentage of the container) */
  labelPos: { left?: string; right?: string; top: string };
}

export const ZONES: ZoneConfig[] = [
  {
    id: "WINGLETS",
    label: "Aerodynamic Winglets",
    short: "Winglets",
    tierName: "Aero Winglet Crew",
    price: 500,
    capacity: 40,
    color: "#F87171",
    print: "Your name or brand etched on BOTH winglets + clickable promo link on the Wrap Wall.",
    desc: "Downforce blades. Only 40 exist. Ever.",
    marker: { x: 788, y: 242 },
    labelPos: { left: "70%", top: "11%" },
  },
  {
    id: "TANK",
    label: "Fuel Tank — Turf War Zone",
    short: "Tank",
    tierName: "Pilot's View",
    price: 100,
    capacity: 500,
    color: "#EF4444",
    print: "Name, Couple Lock, or @Page on the tank — the most photographed panel + decides the City Turf War.",
    desc: "The panel every camera zooms into.",
    marker: { x: 560, y: 284 },
    labelPos: { left: "45%", top: "21%" },
  },
  {
    id: "FAIRING",
    label: "Side Racing Fairing",
    short: "Fairing",
    tierName: "Creator Billboard",
    price: 50,
    capacity: 2000,
    color: "#E2E8F0",
    print: "Clickable @handle / brand backlink tile + printed large on the side racing fairing in every Reel.",
    desc: "Clickable backlink + prime fairing space.",
    marker: { x: 764, y: 308 },
    labelPos: { right: "1%", top: "46%" },
  },
  {
    id: "BELLY",
    label: "Lower Belly Pan & Fender",
    short: "Belly Pan",
    tierName: "The People's Grid",
    price: 10,
    capacity: 12000,
    color: "#94A3B8",
    print: "Solo tag or Couple/Bro Lock printed permanently in the grid + Official Story Certificate.",
    desc: "₹10–₹20 in. Instant Story Pass + permanent print.",
    marker: { x: 688, y: 398 },
    labelPos: { left: "52%", top: "84%" },
  },
  {
    id: "COWL",
    label: "Rear Aerocowl — VIP Title Sponsors",
    short: "Aerocowl",
    tierName: "VIP Title Sponsors",
    price: 1000,
    capacity: 12,
    color: "#F59E0B",
    print: "Giant brand/couple/creator callout on the rear aerocowl + Reel shoutout + clickable VIP link.",
    desc: "12 slots. The name everyone reads.",
    marker: { x: 248, y: 274 },
    labelPos: { left: "10%", top: "30%" },
  },
];

export const ZONE_MAP: Record<ZoneId, ZoneConfig> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
) as Record<ZoneId, ZoneConfig>;

export const TARGET = 400000;
export const FOUNDER_LIMIT = 500;

export const LIVE_MODE = process.env.NEXT_PUBLIC_LIVE_MODE !== "false";

export const RIDER_PROFILE = {
  name: process.env.NEXT_PUBLIC_RIDER_NAME || "Syntax Rider",
  city: process.env.NEXT_PUBLIC_RIDER_CITY || "India",
  ig: process.env.NEXT_PUBLIC_RIDER_IG || "@peoplesrr310",
  day: Math.max(1, Number(process.env.NEXT_PUBLIC_CHALLENGE_DAY || "1") || 1),
};

export const CLAN_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Kolkata",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Jaipur",
] as const;

export const WRAP_LIVERY_OPTIONS = [
  { id: "racing-red", label: "Racing Red + White Names", desc: "Classic TVS factory track look" },
  { id: "stealth-carbon", label: "Stealth Carbon + Neon Red", desc: "Matte black vinyl with crimson type" },
  { id: "tricolor-bto", label: "BTO White & Red Tricolor", desc: "Factory race-replica livery" },
] as const;

export const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || "peoplesapache@upi";
export const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || "Apache310Wrap";

export const COST_BREAKDOWN = [
  { icon: "bike", label: "Bike Ex-Showroom & BTO Packs", amount: 315000, note: "Top-spec RR310 + BTO racing kit & aero winglets" },
  { icon: "file", label: "RTO, Road Tax & Insurance", amount: 65000, note: "Registration, mandatory cover, on-road costs" },
  { icon: "layers", label: "Custom Vinyl Wrap & Laminate", amount: 20000, note: "Full-body printed wrap + UV protective laminate" },
];

export const FAQS = [
  {
    q: "How do I pay? Do I have to type any UTR number?",
    a: "Zero UTR hassle. Pick your mode, zone, and amount, then complete payment in 1 tap inside Razorpay Checkout (GPay / PhonePe / Paytm / UPI / Cards). Our webhook confirms your slot automatically and unlocks your Story Certificate.",
  },
  {
    q: "What do the First 500 Founder Batch #01 spots get?",
    a: "Every verified slot in Founder Batch #01 (first 500 spots) gets 2× vinyl wrap area FREE (so ₹10 = 4 cm², ₹20 = 8 cm²) plus a clickable external social link on the Wrap Wall.",
  },
  {
    q: "What is Bro / Couple Lock vs. Promote @Page?",
    a: "Bro / Couple Lock prints two names together (e.g. ROHAN × PRIYA) on the bike and gives you an official downloadable Story Certificate to share. Promote @Page turns your Wrap Wall tile into an active clickable link to your Instagram, YouTube, X, or portfolio.",
  },
  {
    q: "How will my name actually be printed on the RR 310?",
    a: "A vinyl wrap shop prints the complete vector wrap directly from our verified ledger CSV. Every slot is a real named cell on the panel, and the wrap installation is filmed in 4K so you can find your handle.",
  },
  {
    q: "What if the ₹4,00,000 goal isn't reached?",
    a: "Every rupee is tracked publicly in the Open Ledger below. If we fall short, contributors vote in the open: extend the campaign, print a community wrap project, or refund pro-rata from the locked pool.",
  },
];

export const PROMISES = [
  { icon: "video", title: "1-Tap Razorpay + Webhook", text: "No UTR typing. Automatic webhook confirmation." },
  { icon: "camera", title: "Instant Story Certificate", text: "Download your unwatermarked PNG right after payment." },
  { icon: "users", title: "Clickable Wrap Directory", text: "Every handle/URL links to your IG, YouTube, or X." },
  { icon: "lock", title: "2× Vinyl for First 500", text: "Founder Batch #01 gets double wrap area free." },
];

export const TIERS = [
  { amount: 10, zone: "BELLY" as ZoneId, badge: null },
  { amount: 50, zone: "FAIRING" as ZoneId, badge: null },
  { amount: 100, zone: "TANK" as ZoneId, badge: "MOST POPULAR" },
  { amount: 500, zone: "WINGLETS" as ZoneId, badge: null },
  { amount: 1000, zone: "COWL" as ZoneId, badge: "VIP" },
];

export const QUICK_AMOUNTS = [10, 20, 50, 100, 500, 1000] as const;

/** Wrap real-estate math: ₹5 buys 1 cm² of vinyl (min 2 cm²), 2× free for First 100 Founders */
export function wrapAreaCm2(amount: number, isFounder = false): number {
  const base = Math.max(2, Math.round(amount / 5));
  return isFounder ? base * 2 : base;
}

export function formatINR(n: number): string {
  const safe = Number.isFinite(n) ? Math.round(n) : 0;
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safe)}`;
}

export function formatNum(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

/** Map a custom amount to the zone tier it unlocks */
export function zoneForAmount(amount: number): ZoneId {
  if (amount >= 1000) return "COWL";
  if (amount >= 500) return "WINGLETS";
  if (amount >= 100) return "TANK";
  if (amount >= 50) return "FAIRING";
  return "BELLY";
}

/** Build a safe clickable external URL from a handle or URL (blocks javascript:/data: XSS) */
export function sanitizePromoUrl(rawUrl?: string | null, handle?: string | null): string | null {
  const candidate = (rawUrl || "").trim();
  if (candidate) {
    try {
      const normalized = candidate.startsWith("http://") || candidate.startsWith("https://")
        ? candidate
        : `https://${candidate}`;
      const u = new URL(normalized);
      if (u.protocol === "https:" || u.protocol === "http:") {
        return u.toString();
      }
    } catch {
      return null;
    }
  }
  const cleanHandle = (handle || "").trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
  if (cleanHandle.length >= 2) {
    return `https://instagram.com/${cleanHandle}`;
  }
  return null;
}
