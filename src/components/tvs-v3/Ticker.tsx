"use client";

import { useMemo } from "react";
import { ZONE_MAP, formatINR } from "@/lib/tvs/constants";
import { formatStickerTitle } from "@/lib/tvs/shareCard";
import { recentFeed, useLiveStore } from "@/lib/tvs/store";

export function Ticker() {
  const stats = useLiveStore((s) => s.stats);

  const lines = useMemo(() => {
    const live = recentFeed(stats, 12).map((f) => {
      const z = ZONE_MAP[f.zone];
      const title = formatStickerTitle(f.name, f.partnerName, f.mode);
      const tag = f.city ? ` (${f.city})` : f.handle ? ` (${f.handle})` : "";
      return `${title}${tag} locked ${z?.short ?? f.zone} — ${formatINR(f.amount)}`;
    });

    const fallback = [
      "FOUNDER BATCH #01: First 500 spots get 2× vinyl wrap area FREE",
      "Bro / Couple Lock: Lock Rohan × Priya on a 38 HP RR 310 + get Story Pass PNG",
      "Promote @Page: Claimed handles become clickable external links on the Wrap Wall",
      "Battle of Cities: Tag your city to choose the final wrap accent color",
      "1-Tap Razorpay Checkout — zero manual UTR typing",
    ];
    const all = live.length > 0 ? live : fallback;
    return [...all, ...all];
  }, [stats]);

  return (
    <div className="marquee-hover relative border-y border-white/[0.08] bg-[#11131A]/80 py-3 backdrop-blur" aria-label="Live claims ticker">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="z-10 ml-4 flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#090A0F] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F8FAFC] sm:ml-6">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden />
          Live
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
