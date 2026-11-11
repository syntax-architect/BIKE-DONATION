"use client";

import { create } from "zustand";
import type { ZoneId } from "@/lib/tvs/constants";
import { BASE, BASE_ZONE_SOLD } from "@/lib/tvs/v3";
import type { StatsData } from "@/lib/tvs/types";

export interface FeedItem {
  id: string;
  name: string;
  handle: string | null;
  zone: ZoneId;
  amount: number;
  at: number;
  sim?: boolean;
}

interface ClaimState {
  open: boolean;
  zoneId: ZoneId | null;
  amount: number | null;
  claimedCode: string | null;
  openClaim: (zone?: ZoneId, amount?: number) => void;
  closeClaim: () => void;
  setZone: (z: ZoneId | null) => void;
  setAmount: (a: number | null) => void;
  setClaimedCode: (c: string | null) => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  open: false,
  zoneId: null,
  amount: null,
  claimedCode: null,
  openClaim: (zone, amount) =>
    set({ open: true, zoneId: zone ?? null, amount: amount ?? null }),
  closeClaim: () => set({ open: false }),
  setZone: (zoneId) => set({ zoneId }),
  setAmount: (amount) => set({ amount }),
  setClaimedCode: (claimedCode) => set({ claimedCode }),
}));

interface LiveState {
  stats: StatsData | null;
  /** client-side simulated claims this session (kept in memory only) */
  sim: FeedItem[];
  /** ms timestamp of last stats refresh */
  fetchedAt: number;
  refresh: () => Promise<void>;
  pushSim: (item: FeedItem) => void;
}

let seq = 0;
export const nextFeedId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`;

export const useLiveStore = create<LiveState>((set, get) => ({
  stats: null,
  sim: [],
  fetchedAt: 0,
  refresh: async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const stats = (await res.json()) as StatsData;
        set({ stats, fetchedAt: Date.now() });
      }
    } catch {
      /* telemetry offline — keep last known */
    }
  },
  pushSim: (item) => set({ sim: [item, ...get().sim].slice(0, 40) }),
}));

/* ── Derived selectors (pure functions over store state) ─────────────────── */

export function totalRaised(stats: StatsData | null, sim: FeedItem[]): number {
  const db = stats?.totalRaised ?? 0;
  const simSum = sim.reduce((a, f) => a + f.amount, 0);
  return BASE.raised + db + simSum;
}

export function totalBackers(stats: StatsData | null, sim: FeedItem[]): number {
  const db = stats?.contributorCount ?? 0;
  return BASE.backers + db + sim.length;
}

export function zoneSold(stats: StatsData | null, sim: FeedItem[], zone: ZoneId): number {
  const db = stats?.zones?.[zone]?.sold ?? 0;
  const simSum = sim.filter((f) => f.zone === zone).length;
  return BASE_ZONE_SOLD[zone] + db + simSum;
}

/** recent feed = simulated + real DB claims, newest first */
export function recentFeed(stats: StatsData | null, sim: FeedItem[], take = 14): FeedItem[] {
  const real: FeedItem[] = (stats?.recent ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    zone: r.zone as ZoneId,
    amount: r.amount,
    at: new Date(r.createdAt).getTime(),
  }));
  return [...sim, ...real]
    .sort((a, b) => b.at - a.at)
    .slice(0, take);
}
