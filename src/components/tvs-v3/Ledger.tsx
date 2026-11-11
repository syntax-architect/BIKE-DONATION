"use client";

import { Bike, FileText, Layers, Scale, Vote } from "lucide-react";
import { COST_BREAKDOWN, TARGET, formatINR } from "@/lib/tvs/constants";
import { SectionHead, Reveal } from "./Reveal";

const ICONS: Record<string, typeof Bike> = { bike: Bike, file: FileText, layers: Layers };

export function Ledger() {
  return (
    <section id="transparency" className="scroll-mt-20 bg-muted/40 dark:bg-white/[0.02]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Open Books"
          title={
            <>
              Where <span className="text-racing">every rupee</span> goes. Publicly.
            </>
          }
          sub="No black boxes. The full cost stack of putting this bike on the road, itemised — and what happens if we fall short."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* cost stack */}
          <Reveal>
            <div className="glass card-pop h-full rounded-2xl p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <Scale className="h-5 w-5 text-racing" /> Cost breakdown
              </h3>
              <div className="mt-5 space-y-5">
                {COST_BREAKDOWN.map((c) => {
                  const Icon = ICONS[c.icon] ?? Bike;
                  const pct = Math.round((c.amount / TARGET) * 100);
                  return (
                    <div key={c.label}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground dark:bg-white/8">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold leading-snug">{c.label}</div>
                            <div className="text-xs text-muted-foreground">{c.note}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="tnum text-sm font-bold">{formatINR(c.amount)}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {pct}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-racing/70 to-racing"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-foreground px-4 py-3.5 text-background dark:bg-white dark:text-background">
                <span className="text-sm font-bold uppercase tracking-wider">Total target</span>
                <span className="font-display text-xl font-bold">{formatINR(TARGET)}</span>
              </div>
            </div>
          </Reveal>

          {/* if we fall short */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-2xl border border-volt/25 bg-gradient-to-br from-volt/8 to-transparent p-6 sm:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-volt/15 text-volt dark:text-volt-bright">
                <Vote className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold leading-snug">
                What if the goal isn&rsquo;t reached?
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Nothing disappears. Every rupee stays locked in a public ledger with weekly
                statement drops. If we fall short of ₹4,00,000, the community votes in the open:
                extend the campaign, scale the wrap area, or refund every contributor pro-rata from
                the locked pool.
              </p>
              <p className="mt-4 rounded-xl bg-card/70 p-4 text-sm font-semibold leading-relaxed">
                No silent reroutes. No &ldquo;admin costs&rdquo;. The internet holds the keys.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
