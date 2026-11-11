"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { TARGET } from "@/lib/tvs/constants";
import { nextMilestone } from "@/lib/tvs/psych";
import { totalRaised, totalBackers, useClaimStore, useLiveStore } from "@/lib/tvs/store";

export function StickyBar() {
  const [visible, setVisible] = useState(false);
  const open = useClaimStore((s) => s.open);
  const openClaim = useClaimStore((s) => s.openClaim);
  const previewName = useClaimStore((s) => s.previewName);
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);

  const raised = totalRaised(stats, sim);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const backers = totalBackers(stats, sim);
  const ms = nextMilestone(raised);
  const fastStep = previewName.trim().length >= 2 ? "pay" : "details";

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
          <div className="glass-strong card-pop-lg flex items-center gap-3 rounded-2xl p-2 pl-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-sm font-bold">
                <span className="tnum shrink-0 whitespace-nowrap">{pct}% locked</span>
                <span className="hidden min-w-0 truncate text-xs font-medium text-muted-foreground sm:inline">
                  • {backers.toLocaleString("en-IN")} in • {ms.doubleSpots.toLocaleString("en-IN")} × ₹20 to {ms.next.label}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-racing to-racing-soft"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => openClaim("BELLY", 10, fastStep)}
                className="hidden h-11 items-center rounded-xl border border-racing/30 bg-racing/8 px-3 text-xs font-bold text-racing transition-colors hover:bg-racing hover:text-white active:scale-[0.97] sm:inline-flex"
              >
                ₹10
              </button>
              <button
                type="button"
                onClick={() => openClaim("BELLY", 20, fastStep)}
                className="btn-racing flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white active:scale-[0.97] sm:px-5"
              >
                <Zap className="h-4 w-4" />
                Lock Spot
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                  ₹20
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
