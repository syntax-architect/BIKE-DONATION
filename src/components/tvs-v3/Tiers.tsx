"use client";

import { Check, Coffee, Crown, MousePointerClick, QrCode, Rocket, Sparkles, Zap } from "lucide-react";
import { FOUNDER_LIMIT, TIERS, ZONE_MAP, formatINR, wrapAreaCm2 } from "@/lib/tvs/constants";
import { IDENTITY_LINE, TIER_ANCHOR, ZONE_ANCHOR } from "@/lib/tvs/psych";
import { badgeFor } from "@/lib/tvs/v3";
import { totalBackers, useClaimStore, useLiveStore, zoneSold } from "@/lib/tvs/store";
import { Reveal } from "./Reveal";

export function Tiers() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const activeZone = useClaimStore((s) => s.activeZone);
  const setActiveZone = useClaimStore((s) => s.setActiveZone);
  const previewName = useClaimStore((s) => s.previewName);
  const mode = useClaimStore((s) => s.mode);
  const partnerName = useClaimStore((s) => s.partnerName);
  const previewHandle = useClaimStore((s) => s.previewHandle);

  const stats = useLiveStore((s) => s.stats);
  const backers = totalBackers(stats);
  const isFounder = (stats?.foundersRemaining ?? Math.max(0, FOUNDER_LIMIT - backers)) > 0;

  const fastReady =
    previewName.trim().length >= 2 &&
    (mode !== "COUPLE" || partnerName.trim().length >= 2) &&
    (mode !== "PROMO" || previewHandle.trim().length >= 2);
  const fastStep = fastReady ? "pay" : "details";

  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        {/* ── Sleek 3-Pill Inline Flow Strip (replaces bloated HowItWorks) ── */}
        <Reveal>
          <div className="grid gap-2.5 rounded-2xl border border-white/[0.08] bg-[#11131A] p-3 sm:grid-cols-3">
            {[
              { icon: MousePointerClick, label: "1. Pick Mode & Zone", sub: "Solo, Couple/Bro Lock, or @Page" },
              { icon: QrCode, label: "2. 1-Tap Razorpay", sub: "GPay / PhonePe — zero UTR typing" },
              { icon: Sparkles, label: "3. Story Pass + Bike Print", sub: "Download PNG & go live on wall" },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#090A0F] px-3.5 py-2.5">
                <step.icon className="h-4.5 w-4.5 shrink-0 text-racing" />
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-[#F8FAFC]">{step.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Featured ₹10 / ₹20 Founder Impulse Banner ── */}
        <Reveal delay={0.05} className="mt-5">
          <div className="card-pop relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131A] p-5 sm:flex-row sm:items-center">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#EF4444]" />
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-racing">
                <Coffee className="h-3.5 w-3.5" /> Founder Batch #01 • {isFounder ? "2× Area Active" : "Standard Pricing"}
              </div>
              <h3 className="mt-1 font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
                Lock a ₹20 Bro/Couple Pass or ₹50 Clickable @Page Billboard
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                First 500 verified slots get <strong className="text-[#F8FAFC]">2× vinyl wrap area FREE</strong> — ₹10 gives 4 cm², ₹20 gives 8 cm² + instant Story Certificate.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => openClaim("BELLY", 10, fastStep)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] bg-[#090A0F] px-4 text-sm font-bold text-[#F8FAFC] transition-colors hover:border-racing hover:bg-racing hover:text-white active:scale-[0.98] sm:flex-initial"
              >
                ₹10 ({isFounder ? "4 cm²" : "2 cm²"})
              </button>
              <button
                type="button"
                onClick={() => openClaim("BELLY", 20, fastStep)}
                className="btn-racing inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:flex-initial"
              >
                <Zap className="h-4 w-4" /> ₹20 ({isFounder ? "8 cm²" : "4 cm²"})
              </button>
            </div>
          </div>
        </Reveal>

        {/* ── Unified Zone + Pricing Grid (5 Tiers + Custom) ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t, i) => {
            const z = ZONE_MAP[t.zone];
            const sold = zoneSold(stats, z.id);
            const left = Math.max(0, z.capacity - sold);
            const isHighlighted = activeZone === z.id;
            const popular = t.badge === "MOST POPULAR";
            const vip = t.badge === "VIP";

            return (
              <Reveal key={t.amount} delay={i * 0.04}>
                <div
                  onMouseEnter={() => setActiveZone(z.id)}
                  className={`relative flex h-full flex-col rounded-2xl border bg-[#11131A] p-5 transition-all hover:-translate-y-1 sm:p-6 ${
                    isHighlighted
                      ? "card-pop-lg border-racing/70 ring-1 ring-racing/35"
                      : popular
                        ? "card-pop-lg border-white/[0.08] shadow-[0_24px_60px_-24px_rgba(220,38,38,0.4)]"
                        : "card-pop border-white/[0.08]"
                  }`}
                >
                  {(popular || vip || isHighlighted) && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-3 overflow-hidden rounded-t-2xl"
                    >
                      <div
                        className="h-[2px] w-full"
                        style={{ background: vip ? "#F59E0B" : "#EF4444" }}
                      />
                    </div>
                  )}

                  {t.badge && (
                    <span
                      className={`absolute -top-3 left-5 flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        popular ? "btn-racing text-white" : "bg-[#F59E0B] text-[#090A0F]"
                      }`}
                    >
                      {vip ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {t.badge}
                    </span>
                  )}

                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-display text-[2rem] font-bold tracking-tight text-[#F8FAFC]">
                      {formatINR(t.amount)}
                      {t.amount >= 1000 && (
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
                      {vip ? <Crown className="h-3.5 w-3.5 text-[#F59E0B]" /> : <Rocket className="h-3.5 w-3.5 text-racing" />}
                      {IDENTITY_LINE[t.zone]}
                    </span>
                    <span className="font-mono text-[11px]">{TIER_ANCHOR[t.amount]}</span>
                  </div>

                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    <li className="flex gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${vip ? "text-[#F59E0B]" : popular ? "text-racing" : "text-[#94A3B8]"}`} />
                      <span className="text-muted-foreground">{z.print}</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${vip ? "text-[#F59E0B]" : popular ? "text-racing" : "text-[#94A3B8]"}`} />
                      <span className="text-muted-foreground">
                        <strong className="text-[#F8FAFC]">{wrapAreaCm2(t.amount, isFounder)} cm²</strong>{" "}
                        {isFounder ? "(2× Founder Bonus)" : "wrap real estate"}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${vip ? "text-[#F59E0B]" : popular ? "text-racing" : "text-[#94A3B8]"}`} />
                      <span className="text-muted-foreground">{ZONE_ANCHOR[z.id]}</span>
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{sold.toLocaleString("en-IN")} claimed</span>
                    <span className="font-semibold text-[#E2E8F0]">{left.toLocaleString("en-IN")} open</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openClaim(t.zone, t.amount)}
                    className={`mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-colors active:scale-[0.98] ${
                      popular || isHighlighted
                        ? "btn-racing text-white"
                        : "border border-white/[0.12] bg-[#090A0F] text-[#F8FAFC] hover:border-racing hover:bg-racing hover:text-white"
                    }`}
                  >
                    Claim {z.short} — {formatINR(t.amount)}
                  </button>
                </div>
              </Reveal>
            );
          })}

          {/* Custom amount */}
          <Reveal delay={0.22}>
            <div className="card-pop flex h-full flex-col rounded-2xl border border-dashed border-white/[0.14] bg-[#11131A] p-5 sm:p-6">
              <div className="font-display text-[2rem] font-bold tracking-tight text-[#F8FAFC]">Custom ₹</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-racing" /> Any amount above ₹10
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                  <span className="text-muted-foreground">Auto-unlocks the highest bike zone your rupees reach</span>
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                  <span className="text-muted-foreground">Every extra ₹5 adds {isFounder ? "2 cm²" : "1 cm²"} of vinyl</span>
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                  <span className="text-muted-foreground">Includes clickable social link &amp; Story Certificate</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => openClaim("BELLY", 20)}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/[0.12] bg-[#090A0F] text-sm font-bold text-[#F8FAFC] transition-colors hover:border-racing hover:bg-racing hover:text-white active:scale-[0.98]"
              >
                Enter custom amount
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
