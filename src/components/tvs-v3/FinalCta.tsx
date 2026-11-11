"use client";

import { Zap } from "lucide-react";
import { useClaimStore, useLiveStore, totalRaised, totalBackers } from "@/lib/tvs/store";
import { Reveal } from "./Reveal";

export function FinalCta() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const raised = totalRaised(stats, sim);
  const backers = totalBackers(stats, sim);

  return (
    <section className="px-4 pb-14 sm:px-6 lg:px-8">
      <Reveal>
        <div className="stage glow-red card-pop-lg relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-10 sm:py-20">
          <div
            aria-hidden
            className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-racing-soft" />
              {backers.toLocaleString("en-IN")} names • {`₹${(raised / 100000).toFixed(2)}L`} raised •
              one bike
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              ₹10. One name.{" "}
              <span className="bg-gradient-to-r from-racing-soft via-racing to-racing-soft bg-clip-text text-transparent">
                Forever on the fairing.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              In five years, when this bike rolls into a car park, someone will lean in, read the
              wrap, and photograph it. Your name can be in that photo.
            </p>
            <button
              type="button"
              onClick={() => openClaim()}
              className="btn-racing mx-auto mt-8 flex min-h-[54px] items-center gap-2.5 rounded-2xl px-8 text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              <Zap className="h-5 w-5" />
              Claim Your Spot on the Bike — from ₹10
            </button>
            <p className="mt-4 text-xs text-white/45">
              UPI • Verified 12-digit UTR • Refund-protected by community vote
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
