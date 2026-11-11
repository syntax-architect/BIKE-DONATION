"use client";

import { Heart } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";

export function Footer() {
  const openClaim = useClaimStore((s) => s.openClaim);
  return (
    <footer className="mt-auto border-t border-black/[0.07] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="btn-racing flex h-9 w-9 items-center justify-center rounded-xl font-display text-[13px] font-bold text-white">
              RR
            </span>
            <div>
              <div className="font-display text-[15px] font-bold text-ink">
                The People&apos;s TVS Apache RR 310
              </div>
              <div className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">
                FUNDED BY 40,000 INTERNET STRANGERS
              </div>
            </div>
          </div>
          <button
            onClick={() => openClaim()}
            className="btn-racing rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-[1.04] active:scale-95"
          >
            Put your name on the bike
          </button>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-black/[0.06] pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
          <p>
            A community art &amp; funding experiment. Not an investment, not equity — just your
            name, on a superbike, forever.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Built by the swarm with <Heart className="h-3.5 w-3.5 fill-racing text-racing" /> and
            ₹10 at a time
          </p>
        </div>
      </div>
    </footer>
  );
}
