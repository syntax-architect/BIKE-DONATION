"use client";

import { useEffect } from "react";
import { useLiveStore } from "@/lib/tvs/store";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Ticker } from "./Ticker";
import { BikeShowcase } from "./BikeShowcase";
import { Tiers } from "./Tiers";
import { WrapWall } from "./WrapWall";
import { Ledger } from "./Ledger";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { StickyBar } from "./StickyBar";
import { ClaimModal } from "./ClaimModal";

export function ExperimentV3() {
  const refresh = useLiveStore((s) => s.refresh);

  /* fetch real ledger stats on mount + poll every 25s while visible */
  useEffect(() => {
    void refresh();
    const poll = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 25_000);
    return () => clearInterval(poll);
  }, [refresh]);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        {/* 1. Hero + Live Ticker */}
        <Hero />
        <Ticker />

        {/* 2. Interactive Bike Configurator + Unified Tiers */}
        <BikeShowcase />
        <Tiers />

        {/* 3. Clickable Wrap Wall Mosaic */}
        <WrapWall />

        {/* 4. Combined Public Ledger & Cost Breakdown */}
        <Ledger />

        {/* 5. Minimal FAQ */}
        <Faq />
      </main>
      <Footer />
      <StickyBar />
      <ClaimModal />
    </div>
  );
}
