"use client";

import { create } from "zustand";
import type { ClaimMode, ZoneId } from "@/lib/tvs/constants";
import type { StatsData } from "@/lib/tvs/types";

export interface FeedItem {
  id: string;
  name: string;
  partnerName?: string | null;
  handle: string | null;
  linkUrl?: string | null;
  city?: string | null;
  mode?: ClaimMode | string;
  zone: ZoneId;
  amount: number;
  isFounder?: boolean;
  at: number;
}

interface ClaimState {
  open: boolean;
  sessionId: number;
  zoneId: ZoneId | null;
  activeZone: ZoneId | null;
  amount: number | null;
  startStep: "details" | "pay";
  mode: ClaimMode;
  previewName: string;
  partnerName: string;
  previewHandle: string;
  city: string;
  referrer: string | null;
  claimedCode: string | null;
  openClaim: (zone?: ZoneId | null, amount?: number | null, startStep?: "details" | "pay") => void;
  closeClaim: () => void;
  setActiveZone: (z: ZoneId | null) => void;
  setZone: (z: ZoneId | null) => void;
  setAmount: (a: number | null) => void;
  setMode: (m: ClaimMode) => void;
  setPreviewName: (name: string) => void;
  setPartnerName: (name: string) => void;
  setPreviewHandle: (handle: string) => void;
  setCity: (city: string) => void;
  setReferrer: (ref: string | null) => void;
  setClaimedCode: (c: string | null) => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  open: false,
  sessionId: 0,
  zoneId: null,
  activeZone: null,
  amount: null,
  startStep: "details",
  mode: "COUPLE",
  previewName: "",
  partnerName: "",
  previewHandle: "",
  city: "Mumbai",
  referrer: null,
  claimedCode: null,
  openClaim: (zone, amount, startStep) =>
    set((s) => ({
      open: true,
      sessionId: s.sessionId + 1,
      zoneId: zone ?? null,
      amount: amount ?? null,
      startStep: startStep ?? "details",
    })),
  closeClaim: () => set({ open: false, startStep: "details" }),
  setActiveZone: (activeZone) => set({ activeZone }),
  setZone: (zoneId) => set({ zoneId }),
  setAmount: (amount) => set({ amount }),
  setMode: (mode) => set({ mode }),
  setPreviewName: (previewName) => set({ previewName }),
  setPartnerName: (partnerName) => set({ partnerName }),
  setPreviewHandle: (previewHandle) => set({ previewHandle }),
  setCity: (city) => set({ city }),
  setReferrer: (referrer) => set({ referrer }),
  setClaimedCode: (claimedCode) => set({ claimedCode }),
}));

interface LiveState {
  stats: StatsData | null;
  fetchedAt: number;
  refresh: () => Promise<void>;
}

export const useLiveStore = create<LiveState>((set) => ({
  stats: null,
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
}));

/* ── Derived selectors (100% real verified DB numbers, zero fake inflation) ── */

export function totalRaised(stats: StatsData | null): number {
  return stats?.totalRaised ?? 0;
}

export function totalBackers(stats: StatsData | null): number {
  return stats?.contributorCount ?? 0;
}

export function zoneSold(stats: StatsData | null, zone: ZoneId): number {
  return stats?.zones?.[zone]?.sold ?? 0;
}

export function recentFeed(stats: StatsData | null, take = 14): FeedItem[] {
  return (stats?.recent ?? [])
    .map((r) => ({
      id: r.id,
      name: r.name,
      partnerName: r.partnerName,
      handle: r.handle,
      linkUrl: r.linkUrl,
      city: r.city,
      mode: r.mode,
      zone: r.zone as ZoneId,
      amount: r.amount,
      isFounder: r.isFounder,
      at: new Date(r.createdAt).getTime(),
    }))
    .slice(0, take);
}
