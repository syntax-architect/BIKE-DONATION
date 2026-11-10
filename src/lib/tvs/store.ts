"use client";

import { create } from "zustand";
import type { ZoneId } from "@/lib/tvs/constants";

interface ClaimState {
  open: boolean;
  zoneId: ZoneId | null;
  amount: number | null;
  openClaim: (zone?: ZoneId, amount?: number) => void;
  closeClaim: () => void;
  setZone: (z: ZoneId | null) => void;
  setAmount: (a: number | null) => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  open: false,
  zoneId: null,
  amount: null,
  openClaim: (zone, amount) =>
    set({ open: true, zoneId: zone ?? null, amount: amount ?? null }),
  closeClaim: () => set({ open: false }),
  setZone: (zoneId) => set({ zoneId }),
  setAmount: (amount) => set({ amount }),
}));
