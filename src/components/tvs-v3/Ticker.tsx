"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { ZONE_MAP } from "@/lib/tvs/constants";
import { SEED_TICKER } from "@/lib/tvs/v3";
import { recentFeed, useLiveStore } from "@/lib/tvs/store";

function tickerLine(name: string, zone: string, amount: number, handle: string | null) {
  const z = ZONE_MAP[zone as keyof typeof ZONE_MAP];
  const who = handle ? `${name} ${handle}` : name;
  const tag =
    z.id === "WINGLETS"
      ? "joined the Winglet Crew"
      : z.id === "COWL"
        ? "became a Title Sponsor"
        : `claimed a ${z.short} slot`;
  return `⚡ ${who} ${tag} (₹${amount.toLocaleString("en-IN")})`;
}

export function Ticker() {
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);

  const lines = useMemo(() => {
    const live = recentFeed(stats, sim, 12).map((f) =>
      tickerLine(f.name, f.zone, f.amount, f.handle),
    );
    const seed = SEED_TICKER.map((s) => tickerLine(s.name, s.zone, s.amount, null));
    const all = [...live, ...seed];
    // duplicate the list so the -50% marquee loops seamlessly
    return all.length ? [...all, ...all] : [];
  }, [stats, sim]);

  return (
    <div className="marquee-hover relative border-y bg-card/50 py-3 backdrop-blur" aria-label="Live claims ticker">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="z-10 ml-4 flex shrink-0 items-center gap-1.5 rounded-full bg-racing px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white sm:ml-6">
          <Flame className="h-3 w-3" /> Live
        </span>
        <div className="animate-marquee flex w-max shrink-0 items-center gap-8 whitespace-nowrap text-sm text-muted-foreground">
          {lines.map((l, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>{l}</span>
              <span className="h-1 w-1 rounded-full bg-racing/50" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
