"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ZONE_MAP, formatINR } from "@/lib/tvs/constants";
import { randomSimClaim } from "@/lib/tvs/v3";
import { nextFeedId, useClaimStore, useLiveStore } from "@/lib/tvs/store";

export function LiveToasts() {
  const open = useClaimStore((s) => s.open);
  const pushSim = useLiveStore((s) => s.pushSim);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(fire, 14_000 + Math.random() * 12_000);
    };
    const fire = () => {
      if (!document.hidden && !useClaimStore.getState().open) {
        const c = randomSimClaim();
        const z = ZONE_MAP[c.zone];
        pushSim({ ...c, id: nextFeedId(), at: Date.now(), sim: true });
        toast(`⚡ ${c.name}${c.handle ? ` ${c.handle}` : ""} just claimed a ${z.short} slot`, {
          description: `${z.tierName} • ${formatINR(c.amount)} — the fill rate just moved.`,
          duration: 5200,
        });
      }
      schedule();
    };
    schedule();
    return () => clearTimeout(timer);
  }, [pushSim]);

  /* toast fired once per claim; `open` intentionally not re-subscribed to avoid resetting the loop */
  void open;
  return null;
}
