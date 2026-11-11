// ── V3 data: real-photo gallery, hotspots, seeded social proof, badges ──────

import type { ZoneId } from "./constants";

/* Real TVS Apache RR 310 photography, all locally hosted in /public/bike */
export interface GalleryShot {
  id: string;
  src: string;
  label: string;
  caption: string;
  /** portrait studio shots blend into the dark stage via mix-blend-lighten */
  blend: boolean;
  /** focus hint for object-position on cover shots */
  pos?: string;
}

export const GALLERY: GalleryShot[] = [
  {
    id: "studio-dyna",
    src: "/bike/studio-dyna-clean.png",
    label: "3/4 Aero",
    caption: "Apache RR 310 — Racing Red with BTO aero winglets",
    blend: false,
  },
  {
    id: "studio-side",
    src: "/bike/studio-side-clean.png",
    label: "Side Profile",
    caption: "Full profile — every panel from tail cowl to belly pan",
    blend: false,
  },
  {
    id: "track-duo",
    src: "/bike/track-duo.jpg",
    label: "Track Pack",
    caption: "Apache RR 310 BTO — Racing Red & Factory Race Replica",
    blend: false,
    pos: "50% 45%",
  },
  {
    id: "front-view",
    src: "/bike/front-view.jpg",
    label: "Head On",
    caption: "Twin-pod LED face, winglets & tall race windscreen",
    blend: false,
  },
  {
    id: "rider",
    src: "/bike/rider.jpg",
    label: "Rider's Eye",
    caption: "On the tarmac — Racing Red RR 310 with carbon-look aero",
    blend: false,
  },
  {
    id: "track-action",
    src: "/bike/track-action.jpg",
    label: "Full Tuck",
    caption: "Flat out down the straight on the RR 310",
    blend: false,
  },
  {
    id: "detail-dash",
    src: "/bike/detail-dash.jpg",
    label: "TFT Dash",
    caption: "5-inch vertical race TFT cluster with telemetry",
    blend: false,
  },
];

export const HERO_ANGLES = [
  { id: "studio-dyna", label: "3/4 Aero", src: "/bike/studio-dyna-clean.png", cutout: true },
  { id: "studio-side", label: "Side", src: "/bike/studio-side-clean.png", cutout: true },
  { id: "track-duo", label: "Track", src: "/bike/track-duo.jpg", cutout: false },
] as const;

/** Interactive zones pinned to the cropped studio PNGs */
export interface Hotspot {
  zone: ZoneId;
  /** % position inside the image box */
  x: number;
  y: number;
  /** where the info card anchors: l = left of pin, r = right of pin */
  side: "l" | "r";
}

export const SIDE_HOTSPOTS: Hotspot[] = [
  { zone: "WINGLETS", x: 80, y: 39, side: "l" },
  { zone: "TANK", x: 52, y: 24, side: "l" },
  { zone: "FAIRING", x: 61, y: 55, side: "l" },
  { zone: "BELLY", x: 57, y: 76, side: "l" },
  { zone: "COWL", x: 16, y: 24, side: "r" },
];

export const DYNA_HOTSPOTS: Hotspot[] = [
  { zone: "WINGLETS", x: 52, y: 38, side: "l" },
  { zone: "TANK", x: 42, y: 20, side: "r" },
  { zone: "FAIRING", x: 36, y: 50, side: "r" },
  { zone: "BELLY", x: 47, y: 70, side: "l" },
  { zone: "COWL", x: 20, y: 28, side: "r" },
];

/** Baseline demo ledger so the page never looks empty (real claims stack on top) */
export const BASE = {
  raised: 148200,
  backers: 5999,
};

export const BASE_ZONE_SOLD: Record<ZoneId, number> = {
  WINGLETS: 22, // 18 left — matches "Only 18 spots left"
  TANK: 214,
  FAIRING: 1105,
  BELLY: 4655,
  COWL: 3, // 9 left of 12 — genuine VIP scarcity
};

export const CAMPAIGN_DEADLINE = new Date("2026-12-31T23:59:59+05:30");

export interface SeedTop {
  name: string;
  handle: string;
  zone: ZoneId;
  amount: number;
}

/** Hall of Fame seed — replaces into real DB claims as they arrive */
export const SEED_TOP: SeedTop[] = [
  { name: "Arjun Mehta", handle: "@trackdayarjun", zone: "COWL", amount: 5000 },
  { name: "Ritika Sharma", handle: "@ritikarides", zone: "COWL", amount: 2500 },
  { name: "Karthik Iyer", handle: "@km_iyer", zone: "WINGLETS", amount: 1500 },
  { name: "Sana Qureshi", handle: "@sanaq", zone: "WINGLETS", amount: 1000 },
  { name: "Dev Patel", handle: "@dev_310", zone: "WINGLETS", amount: 750 },
  { name: "Meghna Rao", handle: "@megs", zone: "TANK", amount: 500 },
  { name: "Vikram Singh", handle: "@vikkusingh", zone: "TANK", amount: 500 },
  { name: "Aditi Basu", handle: "@aditi.b", zone: "TANK", amount: 400 },
  { name: "Rohan Das", handle: "@rohanrr", zone: "TANK", amount: 300 },
  { name: "Farhan Ali", handle: "@fary", zone: "FAIRING", amount: 250 },
];

export const SEED_TICKER: SeedTop[] = [
  { name: "Ankit", handle: "", zone: "TANK", amount: 100 },
  { name: "Priya", handle: "", zone: "WINGLETS", amount: 500 },
  { name: "Dev", handle: "", zone: "BELLY", amount: 10 },
  { name: "Nikhil", handle: "@nik_310", zone: "FAIRING", amount: 50 },
  { name: "Ishita", handle: "", zone: "TANK", amount: 100 },
  { name: "Sameer", handle: "", zone: "BELLY", amount: 10 },
  { name: "Tanvi", handle: "@tanvi.r", zone: "FAIRING", amount: 50 },
  { name: "Rahul", handle: "", zone: "WINGLETS", amount: 500 },
  { name: "Aarav", handle: "", zone: "BELLY", amount: 10 },
  { name: "Zoya", handle: "@zoya.z", zone: "TANK", amount: 100 },
];

const FIRST = [
  "Aarav", "Vivaan", "Ananya", "Diya", "Aditya", "Kabir", "Ishaan", "Myra",
  "Rudra", "Anika", "Arjun", "Saanvi", "Reyansh", "Aadya", "Krish", "Pari",
  "Yash", "Navya", "Dhruv", "Sara", "Om", "Kiara", "Veer", "Riya",
  "Siddharth", "Pooja", "Nikhil", "Trisha", "Harsh", "Meera",
];

const CITY_TAG = [
  "@mumbai", "@delhi", "@bengaluru", "@pune", "@chennai", "@hyd", "@kolkata",
  "@jaipur", "@indore", "@kochi", "@gurgaon", "@noida", "@ahmedabad", "@goa",
];

export function randomSimClaim(): { name: string; handle: string | null; zone: ZoneId; amount: number } {
  const name = FIRST[Math.floor(Math.random() * FIRST.length)];
  const withHandle = Math.random() < 0.55;
  const handle = withHandle ? CITY_TAG[Math.floor(Math.random() * CITY_TAG.length)] : null;
  // weighted toward small entries — mirrors a real ₹10-led curve
  const r = Math.random();
  let zone: ZoneId = "BELLY";
  let amount = 10;
  if (r > 0.93) {
    zone = "WINGLETS";
    amount = 500;
  } else if (r > 0.8) {
    zone = "COWL";
    amount = 1000;
  } else if (r > 0.52) {
    zone = "TANK";
    amount = 100;
  } else if (r > 0.3) {
    zone = "FAIRING";
    amount = 50;
  } else {
    zone = "BELLY";
    amount = 10;
  }
  return { name, handle, zone, amount };
}

/** Gamified title for the success screen */
export function badgeFor(amount: number): { title: string; note: string } {
  if (amount >= 1000) return { title: "Title Sponsor", note: "VIP aerocowl + permanent Hall of Fame pin" };
  if (amount >= 500) return { title: "Aero Crew", note: "Winglet real estate + call sign" };
  if (amount >= 100) return { title: "Tank Pilot", note: "The most photographed panel on the bike" };
  if (amount >= 50) return { title: "Fairing Squad", note: "High-visibility billboard placement" };
  return { title: "Founding Grid", note: "Your name in the people's grid, forever" };
}
