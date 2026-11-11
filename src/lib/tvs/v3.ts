// ── V3 bike showcase assets, hotspots, and badge helpers ───────────────────

import type { ZoneId } from "./constants";

export interface GalleryShot {
  id: string;
  src: string;
  label: string;
  caption: string;
  blend: boolean;
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

export interface Hotspot {
  zone: ZoneId;
  x: number;
  y: number;
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

export function badgeFor(amount: number): { title: string; note: string } {
  if (amount >= 1000) return { title: "Title Sponsor", note: "VIP aerocowl + clickable link + Reel shoutout" };
  if (amount >= 500) return { title: "Aero Crew", note: "Winglet real estate + clickable social link" };
  if (amount >= 100) return { title: "Tank Pilot", note: "Most photographed panel + Turf War boost" };
  if (amount >= 50) return { title: "Fairing Squad", note: "Creator billboard + clickable @Page link" };
  return { title: "Founding Grid", note: "Permanent name or Couple Lock + Story Certificate" };
}
