import type { ClaimMode, ZoneId } from "./constants";

export interface ClaimRecord {
  id: string;
  name: string;
  partnerName?: string | null;
  handle: string | null;
  linkUrl?: string | null;
  city?: string | null;
  mode?: ClaimMode | string;
  zone: string;
  amount: number;
  isFounder?: boolean;
  status?: string;
  createdAt: string;
}

export interface ZoneStat {
  sold: number;
  remaining: number;
}

export interface CityStat {
  city: string;
  totalAmount: number;
  totalCm2: number;
  count: number;
}

export interface StatsData {
  totalRaised: number;
  target: number;
  contributorCount: number;
  foundersRemaining: number;
  progressPct: number;
  zones: Record<ZoneId, ZoneStat>;
  cities: CityStat[];
  recent: ClaimRecord[];
  top: ClaimRecord[];
  razorpayConfigured: boolean;
  updatedAt: string;
}

export interface ClaimResponse {
  claim: ClaimRecord;
  code: string;
  cm2: number;
}
