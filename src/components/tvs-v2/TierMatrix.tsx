"use client";

import { motion } from "framer-motion";
import { Check, Crown, Star } from "lucide-react";
import { TIERS, formatINR, ZONE_MAP, wrapAreaCm2 } from "@/lib/tvs/constants";
import { IDENTITY_LINE, TIER_ANCHOR } from "@/lib/tvs/psych";
import { useClaimStore } from "@/lib/tvs/store";
import { Reveal, SectionHead } from "./Reveal";

export function TierMatrix() {
  const openClaim = useClaimStore((s) => s.openClaim);

  return (
    <section id="tiers" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="halftone pointer-events-none absolute inset-x-0 top-10 h-40 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          kicker="PRICING MATRIX"
          title={
            <>
              Cheaper than lunch.{" "}
              <span className="text-racing">Bigger than a billboard.</span>
            </>
          }
          sub="Every tier is anchored to something you already spend on — except this purchase gets your name filmed in 4K, on a real superbike, forever."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t, i) => {
            const z = ZONE_MAP[t.zone];
            const popular = t.badge === "MOST POPULAR";
            const vip = t.badge === "VIP";
            return (
              <Reveal key={t.amount} delay={i * 0.06} className="h-full">
                <motion.button
                  onClick={() => openClaim(t.zone, t.amount)}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex h-full w-full flex-col rounded-3xl border p-5 text-left transition-shadow duration-300 ${
                    popular
                      ? "border-racing/50 bg-white shadow-[0_20px_44px_-18px_rgba(225,29,72,0.45)]"
                      : "border-black/[0.08] bg-white card-pop hover:shadow-[0_20px_44px_-20px_rgba(16,24,40,0.3)]"
                  }`}
                >
                  {popular ? (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#f43f5e,#be123c)] px-3 py-1 font-mono text-[9.5px] font-bold tracking-[0.14em] text-white shadow-md">
                      <Star className="h-2.5 w-2.5 fill-current" /> MOST POPULAR
                    </span>
                  ) : null}
                  {vip ? (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-vip-bright px-3 py-1 font-mono text-[9.5px] font-bold tracking-[0.14em] text-white shadow-md">
                      <Crown className="h-2.5 w-2.5 fill-current" /> VIP
                    </span>
                  ) : null}

                  <div
                    className="tnum font-display text-[2rem] font-bold leading-none tracking-tight"
                    style={{ color: z.color }}
                  >
                    {formatINR(t.amount)}
                    {t.amount === 1000 ? "+" : ""}
                  </div>
                  <div className="mt-1 text-[12px] font-medium italic text-muted-foreground">
                    {TIER_ANCHOR[t.amount]}
                  </div>

                  <div className="mt-3.5 rounded-xl bg-secondary/70 px-3 py-2">
                    <div className="font-mono text-[9.5px] font-bold tracking-[0.14em] text-muted-foreground">
                      {IDENTITY_LINE[t.zone]}
                    </div>
                    <div className="text-[13px] font-bold leading-snug text-ink">{z.short}</div>
                  </div>

                  <ul className="mt-3.5 flex-1 space-y-2">
                    <Perk text={`${wrapAreaCm2(t.amount)} cm² of wrap real estate`} />
                    <Perk text="Name in the 4K wrap film" />
                    <Perk text="Public ledger entry" />
                    {t.amount >= 500 ? <Perk text="Custom 15-char call sign" /> : null}
                    {t.amount >= 1000 ? <Perk text="Permanent Hall of Fame pin" /> : null}
                  </ul>

                  <div
                    className={`mt-4 rounded-xl py-2.5 text-center text-[13px] font-bold transition-transform duration-200 group-hover:scale-[1.02] ${
                      popular
                        ? "btn-racing text-white"
                        : "border border-black/10 bg-secondary text-ink"
                    }`}
                  >
                    Claim ₹{t.amount} slot
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-relaxed text-muted-foreground">
            Prefer a different amount? The claim sheet accepts any value from ₹10 and auto-maps it
            to the best zone it unlocks —{" "}
            <button
              onClick={() => openClaim(null, null)}
              className="font-bold text-racing underline decoration-racing/30 underline-offset-2 hover:decoration-racing"
            >
              open a blank claim sheet
            </button>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Perk({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-1.5 text-[12.5px] leading-snug text-muted-foreground">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-volt" strokeWidth={3} />
      {text}
    </li>
  );
}
