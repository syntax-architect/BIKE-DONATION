"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Crown, Ruler } from "lucide-react";
import { Reveal, SectionHeader } from "./Reveal";
import {
  TIERS,
  ZONE_MAP,
  formatINR,
  formatNum,
  wrapAreaCm2,
  zoneForAmount,
  type ZoneId,
} from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { StatsData } from "@/lib/tvs/types";

export function TierMatrix({ stats }: { stats: StatsData | null }) {
  const openClaim = useClaimStore((s) => s.openClaim);
  const [custom, setCustom] = useState("");
  const customNum = Math.max(0, Math.round(Number(custom) || 0));
  const customZone: ZoneId = customNum >= 10 ? zoneForAmount(customNum) : "BELLY";
  const customValid = customNum >= 10;

  return (
    <section id="tiers" className="relative py-20 md:py-28 scroll-mt-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          index="03"
          kicker="Contribution Tiers"
          title={
            <>
              Every Rupee Buys{" "}
              <span className="text-volt text-glow-volt italic">Vinyl Real Estate</span>
            </>
          }
          sub="Five fixed tiers, one promise: whatever you put in is what gets printed. ₹5 = 1 cm² of wrap. Your name, your handle, your joke — on a real superbike."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TIERS.map((tier, i) => {
            const zone = ZONE_MAP[tier.zone];
            const remaining = stats?.zones?.[tier.zone]?.remaining ?? zone.capacity;
            const sold = stats?.zones?.[tier.zone]?.sold ?? 0;
            const popular = tier.badge === "MOST POPULAR";
            const scarce = remaining <= 20;
            return (
              <Reveal key={tier.amount} delay={i * 0.06} className="h-full">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative flex h-full flex-col rounded-2xl p-5 overflow-hidden ${
                    popular
                      ? "border border-racing/60 bg-gradient-to-b from-racing/12 to-transparent shadow-[0_0_50px_rgba(225,29,72,0.15)]"
                      : "border border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                  } transition-colors`}
                >
                  {tier.badge && (
                    <span
                      className={`absolute top-0 right-0 rounded-bl-xl px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.18em] ${
                        popular ? "bg-racing text-white" : "bg-vip text-black"
                      }`}
                    >
                      {popular ? "★ MOST POPULAR" : "★ VIP"}
                    </span>
                  )}

                  <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
                    TIER {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-[34px] font-bold leading-none text-zinc-50 tnum">
                      {formatINR(tier.amount)}
                    </span>
                    {tier.badge === "VIP" && <span className="font-mono text-[12px] text-zinc-500">+</span>}
                  </div>
                  <div className="mt-2 text-[13.5px] font-semibold text-zinc-200">{zone.tierName}</div>
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase mt-0.5" style={{ color: zone.color }}>
                    {zone.label.split("—")[0]}
                  </div>

                  <div className="mt-3.5 inline-flex items-center gap-1.5 self-start rounded-md bg-white/5 px-2 py-1 font-mono text-[10.5px] text-zinc-300">
                    <Ruler className="w-3 h-3 text-zinc-500" />≈ {wrapAreaCm2(tier.amount)} cm² OF WRAP
                  </div>

                  <p className="mt-3.5 text-[12px] leading-relaxed text-zinc-400 flex-1">{zone.print}</p>

                  <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                    <span className={scarce ? "text-racing-soft" : ""}>{formatNum(remaining)} LEFT</span>
                    <span>{formatNum(sold)} IN</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openClaim(tier.zone, tier.amount)}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold transition-all ${
                      popular
                        ? "bg-racing text-white shadow-[0_0_28px_rgba(225,29,72,0.4)] hover:shadow-[0_0_44px_rgba(225,29,72,0.55)]"
                        : "border border-white/12 text-zinc-100 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    Claim {formatINR(tier.amount)} Slot <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* custom amount */}
        <Reveal delay={0.15}>
          <div className="mt-6 rounded-2xl border border-dashed border-white/14 bg-white/[0.02] p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="font-display text-lg font-bold text-zinc-50">
                  Or set your own price
                </div>
                <p className="mt-1 text-[12.5px] text-zinc-500">
                  Minimum ₹10. We auto-match your amount to the highest zone tier it unlocks.
                </p>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-[190px]">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="250"
                    aria-label="Custom contribution amount in rupees, minimum 10"
                    className="w-full rounded-lg border border-white/12 bg-black/40 py-2.5 pl-8 pr-3 font-mono text-[15px] text-zinc-100 placeholder:text-zinc-700 focus:border-volt/60 focus:outline-none focus:ring-1 focus:ring-volt/40"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                  <span className="text-zinc-700">→</span>
                  {customValid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: `${ZONE_MAP[customZone].color}1a`, color: ZONE_MAP[customZone].color }}>
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {ZONE_MAP[customZone].short} — {ZONE_MAP[customZone].tierName}
                    </span>
                  ) : (
                    <span className="text-zinc-600">MIN ₹10</span>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={!customValid}
                  onClick={() => customValid && openClaim(customZone, customNum)}
                  className="inline-flex items-center gap-2 rounded-lg bg-volt px-5 py-2.5 text-[13px] font-bold text-black shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:shadow-[0_0_44px_rgba(16,185,129,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                  {customValid ? <Crown className="w-4 h-4" /> : null}
                  Continue
                </motion.button>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] tracking-wider text-zinc-600">
              * EVERY SLOT INCLUDES: YOUR NAME IN THE PUBLIC LEDGER • TICKER SHOUTOUT • 4K WRAP-DAY FOOTAGE PROOF
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
