// ── Psychological trigger layer ──────────────────────────────────────────────
// Rent-A-Dare milestones (goal-gradient), everyday anchors (relatability framing),
// scarcity copy, and momentum math shared across components.

import type { ZoneId } from "./constants";

export interface Milestone {
  at: number;
  label: string;
  desc: string;
  icon: "flag" | "wind" | "badge-check" | "printer" | "rocket";
}

/** Goal-gradient Rent-A-Dare unlocks: crowd-controlled dares & real rewards. */
export const MILESTONES: Milestone[] = [
  {
    at: 25000,
    label: "Dare #1: Street Signboard",
    desc: "Wear my helmet at a busy crossing holding the Top 20 Founders' names for 3 hours — filmed live.",
    icon: "flag",
  },
  {
    at: 50000,
    label: "Dare #2: Gear Voucher Drop",
    desc: "1 random verified ₹20+ contributor wins a ₹3,500 riding gear voucher on livestream.",
    icon: "wind",
  },
  {
    at: 100000,
    label: "Dare #3: Dealership Booking",
    desc: "TVS showroom order placed live + every Founder #001–#100 name read out on camera.",
    icon: "badge-check",
  },
  {
    at: 200000,
    label: "Dare #4: Turf War Winner Lock",
    desc: "Leading city/clan locks the wrap accent color & gets the first Sunday meetup ride stop.",
    icon: "printer",
  },
  {
    at: 400000,
    label: "Finale: 4K Wrap & Handover",
    desc: "Every solo, couple & creator tile laminated on the RR 310 + track/pillion pass giveaway.",
    icon: "rocket",
  },
];

/** Anchoring: price framed against everyday Indian spending & emotional utility. */
export const ZONE_ANCHOR: Record<ZoneId, string> = {
  BELLY: "Less than a cutting chai — send a Couple/Bro Lock pass right now.",
  FAIRING: "One cold coffee → clickable backlink tile on the bike.",
  TANK: "Skip one movie ticket → boost your City in the Turf War.",
  WINGLETS: "One delivery order → rare aero blade + creator spotlight.",
  COWL: "Title Sponsor billboard → giant font + Reel shoutout.",
};

/** Everyday-cost captions for the tier matrix & modal quick picks. */
export const TIER_ANCHOR: Record<number, string> = {
  10: "≈ one cutting chai",
  20: "≈ one samosa + chai",
  50: "≈ one cold coffee",
  100: "≈ one movie ticket",
  500: "≈ one food-delivery order",
  1000: "≈ one fancy dinner",
};

/** Goal-gradient helper: locate current unlocked & next upcoming milestone. */
export function nextMilestone(raised: number) {
  const nextIdx = MILESTONES.findIndex((m) => m.at > raised);
  if (nextIdx === -1) {
    const last = MILESTONES[MILESTONES.length - 1];
    return {
      current: last,
      next: last,
      prevAt: last.at,
      remaining: 0,
      pctToNext: 100,
      chaiSpots: 0,
      doubleSpots: 0,
    };
  }
  const next = MILESTONES[nextIdx];
  const current = nextIdx > 0 ? MILESTONES[nextIdx - 1] : null;
  const prevAt = current?.at ?? 0;
  const span = Math.max(1, next.at - prevAt);
  const remaining = Math.max(0, next.at - raised);
  const pctToNext = Math.min(100, Math.max(0, Math.round(((raised - prevAt) / span) * 1000) / 10));
  return {
    current,
    next,
    prevAt,
    remaining,
    pctToNext,
    chaiSpots: Math.ceil(remaining / 10),
    doubleSpots: Math.ceil(remaining / 20),
  };
}

/** Scarcity urgency tone based on how full a zone is. */
export function scarcityLine(sold: number, capacity: number): { text: string; tone: "hot" | "warm" | "cool" } {
  const left = Math.max(0, capacity - sold);
  const pct = left / capacity;
  if (left === 0) return { text: "SOLD OUT — waitlist only", tone: "hot" };
  if (pct <= 0.15) return { text: `Only ${left} left — going fast`, tone: "hot" };
  if (pct <= 0.45) return { text: `${left} spots open`, tone: "warm" };
  return { text: `${left} spots open`, tone: "cool" };
}

/** Social identity framing: what the contributor "becomes" at each tier. */
export const IDENTITY_LINE: Record<ZoneId, string> = {
  BELLY: "Couple / Grid Lock",
  FAIRING: "Clickable Billboard",
  TANK: "Turf War Driver",
  WINGLETS: "Aero Crew",
  COWL: "Title Sponsor",
};

/** Momentum math for the hero stat strip. */
export function momentum(stats: {
  totalRaised: number;
  contributorCount: number;
  recent: { amount: number; createdAt: string }[];
}) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const todayCount = stats.recent.filter((r) => new Date(r.createdAt).getTime() > dayAgo).length;
  const avg =
    stats.contributorCount > 0 ? Math.round(stats.totalRaised / stats.contributorCount) : 0;
  return { todayCount, avg };
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
