"use client";

import { Check, Coffee, Crown, Rocket, Sparkles, Zap } from "lucide-react";
import { TIERS, ZONE_MAP, formatINR, wrapAreaCm2 } from "@/lib/tvs/constants";
import { IDENTITY_LINE, TIER_ANCHOR } from "@/lib/tvs/psych";
import { badgeFor } from "@/lib/tvs/v3";
import { useClaimStore } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

export function Tiers() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const previewName = useClaimStore((s) => s.previewName);
  const fastStep = previewName.trim().length >= 2 ? "pay" : "details";

  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Transparent Pricing"
          title={
            <>
              Less than a pizza. <span className="text-racing">Printed on a superbike.</span>
            </>
          }
          sub="₹5 buys one square centimetre of vinyl real estate. Skip one chai (₹10) or samosa (₹20) and ride on the Apache RR 310 forever."
        />

        {/* ── Featured ₹10 / ₹20 micro-impulse banner ── */}
        <Reveal delay={0.05} className="mt-8">
          <div className="glass card-pop flex flex-col items-start justify-between gap-4 rounded-2xl border-racing/30 bg-gradient-to-r from-racing/10 via-card to-volt/10 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-racing/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-racing">
                <Coffee className="h-3 w-3" /> The ₹10–₹20 Chai Challenge
              </div>
              <h3 className="mt-2 font-display text-lg font-bold sm:text-xl">
                Most people drop ₹10 or ₹20 without thinking twice.
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                One cutting chai = your name on the belly pan forever. Double it to ₹20 and get{" "}
                <strong className="text-foreground">4 cm² of bold wrap real estate</strong>.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => openClaim("BELLY", 10, fastStep)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-racing/40 bg-card px-4 text-sm font-bold text-racing transition-colors hover:bg-racing hover:text-white active:scale-[0.98] sm:flex-initial"
              >
                ₹10 • Chai Spot (2 cm²)
              </button>
              <button
                type="button"
                onClick={() => openClaim("BELLY", 20, fastStep)}
                className="btn-racing inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:flex-initial"
              >
                <Zap className="h-4 w-4" /> ₹20 • Double Spot (4 cm²)
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t, i) => {
            const z = ZONE_MAP[t.zone];
            const badge = badgeFor(t.amount);
            const popular = t.badge === "MOST POPULAR";
            const vip = t.badge === "VIP";
            return (
              <Reveal key={t.amount} delay={i * 0.06}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1 ${
                    popular
                      ? "card-pop-lg border-2 border-racing bg-card shadow-[0_24px_60px_-24px_rgba(225,29,72,0.5)]"
                      : "glass card-pop"
                  }`}
                >
                  {t.badge && (
                    <span
                      className={`absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${
                        popular ? "btn-racing" : "bg-gradient-to-r from-amber-500 to-yellow-500"
                      }`}
                    >
                      {vip ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {t.badge}
                    </span>
                  )}

                  <div className="flex items-baseline justify-between">
                    <div className="font-display text-[2rem] font-bold tracking-tight">
                      {formatINR(t.amount)}
                      {t.amount === 1000 && (
                        <span className="text-base font-medium text-muted-foreground">+</span>
                      )}
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={{ background: `${z.color}1f`, color: z.color }}
                    >
                      {z.short}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      {vip ? <Crown className="h-3.5 w-3.5 text-vip-bright" /> : <Rocket className="h-3.5 w-3.5 text-racing" />}
                      {IDENTITY_LINE[t.zone]}
                    </span>
                    {TIER_ANCHOR[t.amount] ? (
                      <span className="font-mono text-[11px] font-medium text-muted-foreground">
                        {TIER_ANCHOR[t.amount]}
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                    <li className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                      <span className="text-muted-foreground">{z.print}</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{wrapAreaCm2(t.amount)} cm²</strong> of
                        wrap real estate
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                      <span className="text-muted-foreground">{badge.note}</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => openClaim(t.zone, t.amount)}
                    className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold active:scale-[0.98] ${
                      popular
                        ? "btn-racing text-white"
                        : "border border-racing/30 bg-racing/5 text-racing hover:bg-racing hover:text-white"
                    }`}
                  >
                    Claim {formatINR(t.amount)} slot
                  </button>
                </div>
              </Reveal>
            );
          })}

          {/* custom */}
          <Reveal delay={0.32}>
            <div className="card-pop flex h-full flex-col rounded-2xl border border-dashed border-racing/40 p-6">
              <div className="font-display text-[2rem] font-bold tracking-tight">₹You</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-racing" /> Your amount, your legacy
              </div>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                  <span className="text-muted-foreground">
                    Auto-unlocks the highest zone your amount reaches
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                  <span className="text-muted-foreground">
                    Every ₹5 = 1 cm² more of your name
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-bright" />
                  <span className="text-muted-foreground">Minimum ₹10 — no upper cap</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => openClaim()}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-racing/30 bg-racing/5 text-sm font-bold text-racing transition-colors hover:bg-racing hover:text-white active:scale-[0.98]"
              >
                Go custom
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
            ₹10 = one coffee skipped. ₹100 = one food-delivery order skipped. Both = your name on a
            machine that gets photographed for years. Psychologically unbeatable trade.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
