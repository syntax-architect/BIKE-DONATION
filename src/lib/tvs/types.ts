import type { ZoneId } from "./constants";

export interface ClaimRecord {
  id: string;
  name: string;
  handle: string | null;
  zone: string;
  amount: number;
  createdAt: string;
}

export interface ZoneStat {
  sold: number;
  remaining: number;
}

export interface StatsData {
  totalRaised: number;
  target: number;
  contributorCount: number;
  progressPct: number;
  zones: Record<ZoneId, ZoneStat>;
  recent: ClaimRecord[];
  top: ClaimRecord[];
  updatedAt: string;
}

export interface ClaimResponse {
  claim: ClaimRecord;
  code: string;
  cm2: number;
}
