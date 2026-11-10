"use client";

import { useCallback, useEffect, useState } from "react";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { LiveTicker } from "./LiveTicker";
import { BikeZoneSelector } from "./BikeZoneSelector";
import { TierMatrix } from "./TierMatrix";
import { Telemetry } from "./Telemetry";
import { FaqPromise } from "./FaqPromise";
import { Footer } from "./Footer";
import { StickyClaimBar } from "./StickyClaimBar";
import { ClaimModal } from "./ClaimModal";
import type { StatsData } from "@/lib/tvs/types";

export function Experiment() {
  const [stats, setStats] = useState<StatsData | null>(null);

  // manual refresh (used after a successful claim)
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) return;
      setStats((await res.json()) as StatsData);
    } catch {
      // telemetry offline — keep last known stats
    }
  }, []);

  // live telemetry polling — setState happens in promise callbacks
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d) setStats(d as StatsData);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav stats={stats} />
      <main className="flex-1">
        <Hero stats={stats} />
        <LiveTicker recent={stats?.recent ?? []} />
        <BikeZoneSelector stats={stats} />
        <TierMatrix stats={stats} />
        <Telemetry stats={stats} />
        <FaqPromise />
      </main>
      <Footer />
      <StickyClaimBar stats={stats} />
      <ClaimModal onClaimed={refresh} />
    </div>
  );
}
