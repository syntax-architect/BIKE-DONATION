"use client";

import { Check, Crown, Rocket, Sparkles } from "lucide-react";
import { TIERS, ZONE_MAP, formatINR, wrapAreaCm2 } from "@/lib/tvs/constants";
import { badgeFor } from "@/lib/tvs/v3";
import { useClaimStore } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

export function Tiers() {
  const openClaim = useClaimStore((s) => s.openClaim);

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
          sub="₹5 buys one square centimetre of vinyl real estate. Pick a tier — or go custom and watch your cm² climb."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    {vip ? <Crown className="h-3.5 w-3.5 text-vip-bright" /> : <Rocket className="h-3.5 w-3.5 text-racing" />}
                    {badge.title}
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
