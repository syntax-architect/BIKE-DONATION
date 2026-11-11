"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { TARGET, formatINR } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { StatsData } from "@/lib/tvs/types";

export function StickyClaimBar({ stats }: { stats: StatsData | null }) {
  const open = useClaimStore((s) => s.open);
  const openClaim = useClaimStore((s) => s.openClaim);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pct = stats ? Math.min(100, (stats.totalRaised / stats.target) * 100) : 0;

  return (
    <AnimatePresence>
      {visible && !open && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden pb-safe"
        >
          <div className="glass-strong rounded-2xl p-3 shadow-[0_12px_48px_rgba(0,0,0,0.6)] flex items-center gap-3.5">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10.5px] text-zinc-300 tnum truncate">
                {formatINR(stats?.totalRaised ?? 0)}{" "}
                <span className="text-zinc-600">/ {formatINR(TARGET)}</span>{" "}
                <span className="text-volt font-bold">{pct.toFixed(1)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-racing to-racing-soft progress-shimmer relative overflow-hidden"
                  style={{ width: `${Math.max(3, pct)}%` }}
                />
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => openClaim("BELLY", 10)}
              className="inline-flex items-center gap-2 shrink-0 rounded-xl bg-racing px-4 py-3 text-[13px] font-bold text-white shadow-[0_0_28px_rgba(225,29,72,0.45)]"
            >
              <Zap className="w-4 h-4" strokeWidth={2.5} />
              Claim Your Slot
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
