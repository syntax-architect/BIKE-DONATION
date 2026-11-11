"use client";

import { Zap } from "lucide-react";
import { ZONE_MAP, formatINR } from "@/lib/tvs/constants";
import { timeAgo } from "@/lib/tvs/psych";
import type { ClaimRecord } from "@/lib/tvs/types";

const FALLBACK = [
  "Ankit claimed a Tank Slot (₹100)",
  "Priya joined the Winglet Crew (₹500)",
  "Dev claimed a ₹10 Belly Pan slot",
  "Meera became a Title Sponsor (₹1,000)",
  "Rohit took fairing inches (₹50)",
];

export function LiveTicker({ recent }: { recent: ClaimRecord[] }) {
  const items: string[] =
    recent.length > 0
      ? recent.map((r) => {
          const z = ZONE_MAP[r.zone as keyof typeof ZONE_MAP];
          return `${r.name} claimed a ${z?.short ?? r.zone} slot (${formatINR(r.amount)}) · ${timeAgo(r.createdAt)}`;
        })
      : FALLBACK;

  const line = [...items, ...items];

  return (
    <div className="marquee-hover relative z-10 border-y border-black/[0.07] bg-ink py-2.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {line.map((t, i) => (
          <span key={i} className="flex items-center gap-2.5 font-mono text-[12px] text-zinc-300">
            <Zap className="h-3 w-3 text-racing-soft" />
            {t}
            <span className="text-zinc-600">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
