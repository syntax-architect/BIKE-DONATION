// ── The People's Apache RR310 — shared domain constants ──────────────────────

export type ZoneId = "BELLY" | "FAIRING" | "TANK" | "WINGLETS" | "COWL";

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
    color: "#38BDF8",
    print: "Your name etched on BOTH winglets + a custom 15-char call sign. The rarest aero real estate on the bike.",
    desc: "Downforce blades. Only 40 exist. Ever.",
    marker: { x: 788, y: 242 },
    labelPos: { left: "70%", top: "11%" },
  },
  {
    id: "TANK",
    label: "Fuel Tank — Pilot's View",
    short: "Tank",
    tierName: "Pilot's View",
    price: 100,
    capacity: 500,
    color: "#E11D48",
    print: "Name + @handle on the tank, right under the rider's hands — the most photographed panel on the bike.",
    desc: "The panel every camera zooms into.",
    marker: { x: 560, y: 284 },
    labelPos: { left: "45%", top: "21%" },
  },
  {
    id: "FAIRING",
    label: "Side Racing Fairing",
    short: "Fairing",
    tierName: "High Visibility",
    price: 50,
    capacity: 2000,
    color: "#10B981",
    print: "Name + @handle printed on the side racing fairing — high-visibility placement in every pan & track photo.",
    desc: "Prime billboard inches, pocket money price.",
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
    color: "#A1A1AA",
    print: "Your name (or @handle) in the people's grid on the belly pan & fender — thousands of names, one swarm.",
    desc: "₹10 in. Your name rides forever.",
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
    print: "Full name + handle + punchline in the largest font on the rear aerocowl, plus a permanent Hall of Fame pin.",
    desc: "12 slots. The name everyone reads.",
    marker: { x: 248, y: 274 },
    labelPos: { left: "10%", top: "30%" },
  },
];

export const ZONE_MAP: Record<ZoneId, ZoneConfig> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
) as Record<ZoneId, ZoneConfig>;

export const TARGET = 400000;
export const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || "peoplesapache@upi";
export const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || "Apache310Wrap";

export const COST_BREAKDOWN = [
  { icon: "bike", label: "Bike Ex-Showroom & BTO Packs", amount: 315000, note: "Top-spec RR310 + BTO racing kit & aero winglets" },
  { icon: "file", label: "RTO, Road Tax & Insurance", amount: 65000, note: "Registration, mandatory cover, on-road costs" },
  { icon: "layers", label: "Custom Vinyl Wrap & Laminate", amount: 20000, note: "Full-body printed wrap + UV protective laminate" },
];

export const FAQS = [
  {
    q: "Is this real?",
    a: "100%. A real, road-legal TVS Apache RR 310 (BTO Racing Edition) gets bought, wrapped and ridden. Delivery day is livestreamed, the full wrap installation is filmed, and every contributor's name/handle is documented on 4K camera as it goes onto the machine. The ledger on this page mirrors every claim.",
  },
  {
    q: "What if the goal isn't reached?",
    a: "Nothing disappears. Every rupee stays locked in a public ledger with weekly statement drops. If we fall short of ₹4,00,000, the community votes in the open: extend the campaign, scale the wrap area, or refund every contributor pro-rata from the locked pool. No silent reroutes, ever.",
  },
  {
    q: "How will my name actually be printed?",
    a: "A professional vinyl shop prints the full wrap from our vector layout. Every ₹10 slot is a named cell in the grid — no random initials. Before printing, we post a proof screenshot of the complete wrap layout so you can find your own handle on the bike.",
  },
  {
    q: "Can I choose what's written?",
    a: "Yes — your name, your @handle, or a 15-character punchline for the higher tiers. Keep it clean: slurs, brands and profanity are auto-rejected at verification and you'll be asked to resubmit your line.",
  },
  {
    q: "How do I pay and how is it verified?",
    a: "Scan the UPI QR (or tap the intent link) for your exact amount, then paste the 12-digit UTR / transaction ID. The ledger checks it against the live bank statement feed; the moment it matches, your slot lights up and your name enters the ticker.",
  },
  {
    q: "Do I own a piece of the bike?",
    a: "Legally, no — you own something better for the internet era: permanent, documented recognition on a 4K-filmed track weapon and a founder's spot in Experiment #01. This is a community art/funding experiment, not an investment or equity scheme.",
  },
];

export const PROMISES = [
  { icon: "video", title: "Delivery-Day Livestream", text: "The bike unboxing and handover goes live. No edits, no cuts." },
  { icon: "camera", title: "4K Wrap Installation Film", text: "Every panel, every name, filmed in macro detail as it's laid." },
  { icon: "users", title: "Every Handle Documented", text: "A public roll-call page lists all contributors, forever." },
  { icon: "lock", title: "Locked Public Ledger", text: "Weekly statements. Every rupee traceable until wrap day." },
];

export const TIERS = [
  { amount: 10, zone: "BELLY" as ZoneId, badge: null },
  { amount: 50, zone: "FAIRING" as ZoneId, badge: null },
  { amount: 100, zone: "TANK" as ZoneId, badge: "MOST POPULAR" },
  { amount: 500, zone: "WINGLETS" as ZoneId, badge: null },
  { amount: 1000, zone: "COWL" as ZoneId, badge: "VIP" },
];

/** Quick-pick rupee amounts in the claim modal (highlights ₹10 & ₹20 micro-entries) */
export const QUICK_AMOUNTS = [10, 20, 50, 100, 500, 1000] as const;

/** Wrap real-estate math: ₹5 buys 1 cm² of vinyl (min 2 cm²) */
export function wrapAreaCm2(amount: number): number {
  return Math.max(2, Math.round(amount / 5));
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
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
