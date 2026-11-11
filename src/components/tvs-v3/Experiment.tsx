"use client";

import { useEffect } from "react";
import { useLiveStore } from "@/lib/tvs/store";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Ticker } from "./Ticker";
import { StatsBand } from "./StatsBand";
import { BikeShowcase } from "./BikeShowcase";
import { Zones } from "./Zones";
import { Tiers } from "./Tiers";
import { HowItWorks } from "./HowItWorks";
import { Telemetry } from "./Telemetry";
import { Ledger } from "./Ledger";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";
import { StickyBar } from "./StickyBar";
import { ClaimModal } from "./ClaimModal";
import { LiveToasts } from "./LiveToasts";

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
        <Hero />
        <Ticker />
        <StatsBand />
        <BikeShowcase />
        <Zones />
        <Tiers />
        <HowItWorks />
        <Telemetry />
        <Ledger />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyBar />
      <ClaimModal />
      <LiveToasts />
    </div>
  );
}
