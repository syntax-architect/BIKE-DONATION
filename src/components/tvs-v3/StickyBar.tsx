"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { TARGET } from "@/lib/tvs/constants";
import { totalRaised, totalBackers, useClaimStore, useLiveStore } from "@/lib/tvs/store";

export function StickyBar() {
  const [inHero, setInHero] = useState(true);
  const [nearEnd, setNearEnd] = useState(false);

  const open = useClaimStore((s) => s.open);
  const openClaim = useClaimStore((s) => s.openClaim);
  const previewName = useClaimStore((s) => s.previewName);
  const mode = useClaimStore((s) => s.mode);
  const partnerName = useClaimStore((s) => s.partnerName);
  const previewHandle = useClaimStore((s) => s.previewHandle);
  const stats = useLiveStore((s) => s.stats);

  const raised = totalRaised(stats);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const backers = totalBackers(stats);

  const fastReady =
    previewName.trim().length >= 2 &&
    (mode !== "COUPLE" || partnerName.trim().length >= 2) &&
    (mode !== "PROMO" || previewHandle.trim().length >= 2);
  const fastStep = fastReady ? "pay" : "details";

  useEffect(() => {
    const heroEl = document.getElementById("top");
    const endTargets = ["faq", "site-footer"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const endVisible = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === heroEl) {
            setInHero(entry.isIntersecting);
          } else {
            endVisible.set(entry.target, entry.isIntersecting);
            setNearEnd(Array.from(endVisible.values()).some(Boolean));
          }
        }
      },
      { threshold: 0.08 },
    );

    if (heroEl) io.observe(heroEl);
    endTargets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const visible = !inHero && !nearEnd && !open;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="glass-strong card-pop-lg flex items-center justify-between gap-3 rounded-2xl p-2 pl-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold sm:text-sm">
                <span className="tnum shrink-0 whitespace-nowrap">{pct}% locked</span>
                <span className="truncate text-xs font-medium text-muted-foreground">
                  • {backers.toLocaleString("en-IN")} slots
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-racing"
                  style={{ width: `${Math.max(backers > 0 ? 2 : 0, pct)}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => openClaim("BELLY", 10, fastStep)}
                className="hidden h-10 items-center rounded-xl border border-white/[0.12] bg-[#090A0F] px-3 text-xs font-bold text-[#F8FAFC] transition-colors hover:border-racing hover:bg-racing hover:text-white active:scale-[0.97] sm:inline-flex"
              >
                ₹10
              </button>
              <button
                type="button"
                onClick={() => openClaim("BELLY", 20, fastStep)}
                className="btn-racing flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white active:scale-[0.97] sm:text-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Lock ₹20
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
