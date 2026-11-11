"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
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

  const pct = stats?.progressPct ?? 0;

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "glass-strong shadow-[0_8px_30px_-12px_rgba(16,24,40,0.25)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="btn-racing flex h-9 w-9 items-center justify-center rounded-xl font-display text-[13px] font-bold text-white">
            RR
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold tracking-tight text-ink">
              The People&apos;s RR310
            </span>
            <span className="block font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground">
              EXPERIMENT #01
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {stats ? (
            <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 backdrop-blur md:flex">
              <span className="relative flex h-2 w-2">
                <span className="ping-slow absolute inline-flex h-2 w-2 rounded-full bg-volt-bright opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
              </span>
              <span className="tnum font-mono text-[11px] font-bold text-ink">
                {formatINR(stats.totalRaised)}
              </span>
              <span className="tnum font-mono text-[11px] text-muted-foreground">
                {pct.toFixed(1)}% funded
              </span>
            </div>
          ) : null}
          <button
            onClick={() => openClaim()}
            className="btn-racing rounded-full px-4 py-2 text-[13px] font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95 sm:px-5"
          >
            Claim a Slot
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
