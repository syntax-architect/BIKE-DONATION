"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { ZONES, formatINR } from "@/lib/tvs/constants";
import { useClaimStore, useLiveStore, zoneSold } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

export function Zones() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);

  return (
    <section id="zones" className="scroll-mt-20 bg-muted/40 dark:bg-white/[0.02]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Five Zones • One Machine"
          title={
            <>
              Pick the inches your <span className="text-racing">name rides on</span>.
            </>
          }
          sub="Every zone is a real panel of the bike that gets wrapped and laminated. Smaller the canvas, bigger the brag."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ZONES.map((z, i) => {
            const sold = zoneSold(stats, sim, z.id);
            const left = Math.max(0, z.capacity - sold);
            const fill = Math.min(100, Math.round((sold / z.capacity) * 100));
            const scarce = left <= Math.max(2, z.capacity * 0.2);
            return (
              <Reveal key={z.id} delay={i * 0.06}>
                <div className="glass card-pop group flex h-full flex-col rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_-20px_rgba(225,29,72,0.35)] sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl text-white"
                        style={{ background: z.color }}
                      >
                        <MapPin className="h-4.5 w-4.5" strokeWidth={2.4} />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold leading-tight">{z.short}</h3>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {z.tierName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-bold text-racing">
                        {formatINR(z.price)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        from
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {z.print}
                  </p>

                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold">
                        {sold.toLocaleString("en-IN")} / {z.capacity.toLocaleString("en-IN")} claimed
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          scarce
                            ? "bg-racing/10 text-racing"
                            : "bg-volt/10 text-volt dark:bg-volt-bright/10 dark:text-volt-bright"
                        }`}
                      >
                        {scarce ? `Only ${left.toLocaleString("en-IN")} left` : `${left.toLocaleString("en-IN")} open`}
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-muted dark:bg-white/10">
                      <div
                        className="progress-shimmer relative h-full overflow-hidden rounded-full transition-[width] duration-1000"
                        style={{
                          width: `${Math.max(3, fill)}%`,
                          background: `linear-gradient(90deg, ${z.color}88, ${z.color})`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openClaim(z.id)}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-racing/30 bg-racing/5 text-sm font-bold text-racing transition-all group-hover:border-racing group-hover:bg-racing group-hover:text-white active:scale-[0.98]"
                  >
                    Claim {z.short} — {formatINR(z.price)}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            );
          })}

          {/* custom amount card */}
          <Reveal delay={0.3}>
            <div className="card-pop flex h-full flex-col items-start justify-center rounded-2xl border border-dashed border-racing/40 bg-gradient-to-br from-racing/8 to-volt-bright/8 p-6 sm:p-8">
              <span className="rounded-full bg-racing/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-racing">
                Feeling generous?
              </span>
              <h3 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
                Claim any amount above ₹10
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Custom contributions unlock the best zone your rupees reach — every extra ₹5 is 1
                more cm² of your printed name.
              </p>
              <button
                type="button"
                onClick={() => openClaim()}
                className="btn-racing mt-5 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white active:scale-[0.98]"
              >
                Enter custom amount <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
