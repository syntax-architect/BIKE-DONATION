"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ZONE_MAP, formatINR, type ZoneId } from "@/lib/tvs/constants";
import { SEED_TICKER } from "@/lib/tvs/v3";
import { useClaimStore, useLiveStore } from "@/lib/tvs/store";

export function LiveToasts() {
  const stats = useLiveStore((s) => s.stats);
  const seenIds = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);
  const tickerIdx = useRef(0);

  /* Toast newly arrived real DB claims without fabricating counter totals */
  useEffect(() => {
    const recent = stats?.recent ?? [];
    if (!seededRef.current && stats) {
      recent.forEach((r) => seenIds.current.add(r.id));
      seededRef.current = true;
      return;
    }
    for (const r of recent) {
      if (!seenIds.current.has(r.id)) {
        seenIds.current.add(r.id);
        if (!document.hidden && !useClaimStore.getState().open) {
          const z = ZONE_MAP[r.zone as ZoneId];
          toast(`⚡ ${r.name}${r.handle ? ` ${r.handle}` : ""} just locked a ${z?.short ?? r.zone} slot`, {
            description: `${formatINR(r.amount)} • verified on the RR 310 ledger`,
            duration: 5000,
          });
        }
      }
    }
  }, [stats]);

  /* Gentle passive social-proof reminder using recent/seeded entries without mutating totals */
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden || useClaimStore.getState().open) return;
      const recent = useLiveStore.getState().stats?.recent ?? [];
      const pool = recent.length > 0 ? recent : SEED_TICKER;
      const item = pool[tickerIdx.current % pool.length];
      tickerIdx.current += 1;
      if (!item) return;
      const z = ZONE_MAP[item.zone as ZoneId];
      toast(`🏍️ ${item.name} is on the ${z?.short ?? item.zone}`, {
        description: `${formatINR(item.amount)} • Add your name from ₹10`,
        duration: 4200,
      });
    }, 28_000);
    return () => clearInterval(timer);
  }, []);

  return null;
}
