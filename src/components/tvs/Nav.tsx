"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";
import { TARGET, formatINR } from "@/lib/tvs/constants";
import type { StatsData } from "@/lib/tvs/types";

export function Nav({ stats }: { stats: StatsData | null }) {
  const openClaim = useClaimStore((s) => s.openClaim);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pct = stats ? Math.min(100, (stats.totalRaised / stats.target) * 100) : 0;

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-[0_8px_40px_rgba(0,0,0,0.5)]" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-racing text-white shadow-[0_0_24px_rgba(225,29,72,0.45)] group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" strokeWidth={2.4} />
          </span>
          <span className="leading-none">
            <span className="block font-display font-bold text-[15px] tracking-tight text-zinc-50">
              PEOPLE&apos;S <span className="text-racing-soft">RR310</span>
            </span>
            <span className="block font-mono text-[9px] tracking-[0.28em] text-zinc-500 mt-1">
              EXPERIMENT #01
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3 md:gap-5">
          {stats && (
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right leading-none">
                <div className="font-mono text-[11px] text-zinc-300 tnum">
                  {formatINR(stats.totalRaised)}{" "}
                  <span className="text-zinc-600">/ {formatINR(TARGET)}</span>
                </div>
                <div className="mt-1.5 h-1 w-36 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-racing to-racing-soft progress-shimmer relative overflow-hidden"
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
              <span className="font-mono text-[11px] text-volt tnum">{pct.toFixed(1)}%</span>
            </div>
          )}
          <button
            onClick={() => openClaim()}
            className="inline-flex items-center gap-2 rounded-lg bg-racing px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_28px_rgba(225,29,72,0.4)] hover:bg-racing/90 hover:shadow-[0_0_40px_rgba(225,29,72,0.55)] active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} />
            Claim Your Slot
          </button>
        </div>
      </div>
    </motion.header>
  );
}
