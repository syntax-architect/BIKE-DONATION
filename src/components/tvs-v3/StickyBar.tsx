"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { TARGET } from "@/lib/tvs/constants";
import { totalRaised, totalBackers, useClaimStore, useLiveStore } from "@/lib/tvs/store";

export function StickyBar() {
  const [visible, setVisible] = useState(false);
  const open = useClaimStore((s) => s.open);
  const openClaim = useClaimStore((s) => s.openClaim);
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);

  const raised = totalRaised(stats, sim);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const backers = totalBackers(stats, sim);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !open && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-1/2 sm:w-[560px] sm:-translate-x-1/2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="glass-strong card-pop-lg flex items-center gap-3 rounded-2xl p-2.5 pl-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-sm font-bold">
                <span className="tnum">{pct}% locked</span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                  • {backers.toLocaleString("en-IN")} strangers in
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-racing to-racing-soft"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => openClaim()}
              className="btn-racing flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white active:scale-[0.97] sm:px-6"
            >
              <Zap className="h-4 w-4" />
              Claim Your Slot
              <span className="hidden rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold sm:inline">
                from ₹10
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
