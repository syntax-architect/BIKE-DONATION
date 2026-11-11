"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, MapPin } from "lucide-react";
import { ZONES, formatINR } from "@/lib/tvs/constants";
import { IDENTITY_LINE, scarcityLine } from "@/lib/tvs/psych";
import { useClaimStore } from "@/lib/tvs/store";
import { Reveal, SectionHead } from "./Reveal";
import type { StatsData } from "@/lib/tvs/types";

export function ZoneCards({ stats }: { stats: StatsData | null }) {
  const openClaim = useClaimStore((s) => s.openClaim);

  return (
    <section id="zones" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          kicker="PICK YOUR REAL ESTATE"
          title={
            <>
              Five zones. One bike.{" "}
              <span className="text-racing">Your name rides forever.</span>
            </>
          }
          sub="Tap a hotspot on the 3D bike or grab a card below — the claim sheet opens pre-filled, and your name lands on the wrap the moment your UPI payment verifies."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ZONES.map((z, i) => {
            const sold = stats?.zones[z.id]?.sold ?? 0;
            const remaining = stats?.zones[z.id]?.remaining ?? z.capacity;
            const sc = scarcityLine(sold, z.capacity);
            const fillPct = Math.min(100, (sold / z.capacity) * 100);
            const hot = sc.tone === "hot";

            return (
              <Reveal key={z.id} delay={i * 0.06}>
                <motion.button
                  onClick={() => openClaim(z.id, z.price)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-white p-5 text-left transition-shadow duration-300 card-pop hover:shadow-[0_24px_48px_-20px_rgba(16,24,40,0.35)] ${
                    hot ? "border-racing/35" : "border-black/[0.08]"
                  }`}
                >
                  {hot ? (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-racing px-2 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.12em] text-white">
                      <Flame className="h-2.5 w-2.5" /> FILLING FAST
                    </span>
                  ) : null}

                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: z.color }}
                    >
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="font-display text-[15px] font-bold leading-tight text-ink">
                        {z.label}
                      </div>
                      <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
                        {IDENTITY_LINE[z.id]}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="tnum font-display text-3xl font-bold tracking-tight text-ink">
                      {formatINR(z.price)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      min · per name
                    </span>
                  </div>

                  <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                    {z.print}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-[10.5px] font-bold">
                      <span className={hot ? "text-racing" : "text-muted-foreground"}>
                        {sc.text.toUpperCase()}
                      </span>
                      <span className="tnum text-muted-foreground">
                        {formatNumShort(sold)}/{formatNumShort(z.capacity)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(4, fillPct)}%`, backgroundColor: z.color }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-racing">
                    Claim this zone
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              </Reveal>
            );
          })}

          {/* custom amount filler card */}
          <Reveal delay={0.3}>
            <CustomCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CustomCard() {
  const openClaim = useClaimStore((s) => s.openClaim);
  return (
    <motion.button
      onClick={() => openClaim(null, null)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-full min-h-[220px] w-full flex-col items-start justify-between overflow-hidden rounded-3xl border-2 border-dashed border-racing/30 bg-gradient-to-br from-accent/70 to-white p-5 text-left transition-shadow card-pop hover:shadow-[0_24px_48px_-20px_rgba(225,29,72,0.35)]"
    >
      <div className="racing-stripes absolute -right-8 -top-8 h-24 w-24 rotate-12 rounded-2xl opacity-20" />
      <div>
        <div className="font-display text-lg font-bold text-ink">
          Your amount. Your legend.
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Add any custom amount above ₹10 — the ledger maps it to the richest zone it unlocks and
          grows your patch of wrap real estate.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-racing">
        Open the claim sheet
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

function formatNumShort(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
}
