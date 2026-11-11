"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { formatINR } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { StatsData } from "@/lib/tvs/types";

export function StickyClaimBar({ stats }: { stats: StatsData | null }) {
  const openClaim = useClaimStore((s) => s.openClaim);
  const pct = stats?.progressPct ?? 0;
  const remaining = Math.max(0, (stats?.target ?? 400000) - (stats?.totalRaised ?? 0));

  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 130, damping: 20, delay: 0.8 }}
      className="fixed inset-x-0 bottom-0 z-40 pb-safe"
    >
      <div className="glass-strong border-t border-black/[0.08] shadow-[0_-12px_40px_-16px_rgba(16,24,40,0.35)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="tnum font-display text-[15px] font-bold text-ink">
                {formatINR(stats?.totalRaised ?? 0)}
              </span>
              <span className="tnum font-mono text-[11px] font-semibold text-racing">
                {pct.toFixed(1)}% funded
              </span>
            </div>
            <div className="tnum truncate font-mono text-[10.5px] text-muted-foreground">
              {formatINR(remaining)} still open — spots from ₹10
            </div>
          </div>
          <button
            onClick={() => openClaim()}
            className="btn-racing inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-5 text-[14px] font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
          >
            <Zap className="h-4 w-4" />
            Claim Your Slot
          </button>
        </div>
      </div>
    </motion.div>
  );
}
