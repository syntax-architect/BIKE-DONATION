"use client";

import { Radio } from "lucide-react";
import { ZONE_MAP, formatINR, type ZoneId } from "@/lib/tvs/constants";
import type { ClaimRecord } from "@/lib/tvs/types";

function TickerItem({ claim }: { claim: ClaimRecord }) {
  const zone = ZONE_MAP[claim.zone as ZoneId];
  const color = zone?.color ?? "#A1A1AA";
  return (
    <div className="inline-flex items-center gap-2.5 px-5 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      <span className="text-zinc-500">⚡</span>
      <span className="font-medium text-zinc-200">{claim.name}</span>
      <span className="text-zinc-500">
        claimed a <span style={{ color }} className="font-medium">{zone?.short ?? claim.zone}</span> slot
      </span>
      <span className="font-mono text-[12px] font-bold text-zinc-400 tnum">
        ({formatINR(claim.amount)})
      </span>
      {claim.handle ? (
        <span className="font-mono text-[11.5px] text-zinc-600">{claim.handle}</span>
      ) : null}
      <span className="pl-4 text-zinc-800 select-none">/</span>
    </div>
  );
}

export function LiveTicker({ recent }: { recent: ClaimRecord[] }) {
  const items = recent.length > 0 ? recent : [];
  // duplicate the sequence so the -50% translateX loop is seamless
  const doubled = [...items, ...items];

  return (
    <section
      aria-label="Live claims ticker"
      className="relative border-y border-white/6 bg-white/[0.02] marquee-hover"
    >
      <div className="relative flex items-stretch overflow-hidden">
        {/* LIVE badge */}
        <div className="relative z-10 flex items-center gap-2.5 shrink-0 bg-racing px-4 md:px-5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-80 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.22em] text-white">
            <Radio className="w-3.5 h-3.5" /> LIVE
          </span>
        </div>

        {/* fade edges */}
        <div className="pointer-events-none absolute left-24 top-0 bottom-0 w-16 z-[5] bg-gradient-to-r from-[#0a0a0c] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-[5] bg-gradient-to-l from-[#0a0a0c] to-transparent" />

        <div className="flex items-center py-3.5 w-max animate-marquee">
          {doubled.length === 0 ? (
            <span className="px-6 font-mono text-[12px] text-zinc-600">
              WAITING FOR FIRST CLAIMS…
            </span>
          ) : (
            doubled.map((claim, i) => <TickerItem key={`${claim.id}-${i}`} claim={claim} />)
          )}
        </div>
      </div>
    </section>
  );
}
