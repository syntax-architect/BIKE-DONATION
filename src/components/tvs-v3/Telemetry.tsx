"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flame, Medal, Trophy } from "lucide-react";
import { ZONES, ZONE_MAP, formatINR } from "@/lib/tvs/constants";
import { SEED_TOP } from "@/lib/tvs/v3";
import { recentFeed, useLiveStore, zoneSold, type FeedItem } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";
import { AnimatedNumber } from "./AnimatedNumber";

function ago(ts: number) {
  const s = Math.max(5, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

export function Telemetry() {
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const feed = useMemo(() => recentFeed(stats, sim, 10), [stats, sim]);

  const top = useMemo(() => {
    const real = (stats?.top ?? []).map((r) => ({
      name: r.name,
      handle: r.handle,
      zone: r.zone,
      amount: r.amount,
    }));
    const merged = [...SEED_TOP, ...real].sort((a, b) => b.amount - a.amount).slice(0, 10);
    return merged;
  }, [stats]);

  const medals = ["text-amber-400", "text-slate-300", "text-orange-400"];

  return (
    <section id="live" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Live Telemetry"
          title={
            <>
              The <span className="text-racing">leaderboard</span> updates as you watch.
            </>
          }
          sub="Every confirmed claim lands here in real time — names, zones, amounts. The internet is watching the fill rate climb."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          {/* Hall of Fame */}
          <Reveal>
            <div className="glass card-pop h-full rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Trophy className="h-5 w-5 text-vip-bright" /> Hall of Fame
                </h3>
                <span className="rounded-full bg-vip/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-vip-bright">
                  Top 10
                </span>
              </div>
              <ol className="mt-4 space-y-1.5">
                {top.map((t, i) => {
                  const z = ZONE_MAP[t.zone as keyof typeof ZONE_MAP];
                  return (
                    <li
                      key={`${t.name}-${i}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/70"
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted font-display text-xs font-bold ${
                          medals[i] ?? "text-muted-foreground"
                        }`}
                      >
                        {i === 0 ? <Crown className="h-4 w-4" /> : i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{t.name}</div>
                        {t.handle && (
                          <div className="truncate font-mono text-[11px] text-muted-foreground">
                            {t.handle}
                          </div>
                        )}
                      </div>
                      {z && (
                        <span
                          className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-block"
                          style={{ background: `${z.color}1f`, color: z.color }}
                        >
                          {z.short}
                        </span>
                      )}
                      <span className="tnum shrink-0 text-sm font-bold text-racing">
                        {formatINR(t.amount)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {/* live feed */}
            <Reveal delay={0.08}>
              <div className="glass card-pop rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                    <Flame className="h-5 w-5 text-racing" /> Claim Feed
                  </h3>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-racing" /> streaming
                  </span>
                </div>
                <ul className="mt-3 max-h-[280px] space-y-1 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {feed.map((f: FeedItem) => {
                      const z = ZONE_MAP[f.zone];
                      return (
                        <motion.li
                          key={f.id}
                          layout
                          initial={{ opacity: 0, y: -12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: z?.color ?? "#888" }}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm">
                            <strong className="font-semibold">{f.name}</strong>
                            {f.handle && (
                              <span className="font-mono text-xs text-muted-foreground"> {f.handle}</span>
                            )}
                            <span className="text-muted-foreground"> • {z?.short ?? f.zone}</span>
                          </span>
                          <span className="tnum text-xs font-bold">{formatINR(f.amount)}</span>
                          <span className="hidden w-14 shrink-0 text-right text-[10px] text-muted-foreground sm:block">
                            {ago(f.at)}
                          </span>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            </Reveal>

            {/* zone fill meters */}
            <Reveal delay={0.14}>
              <div className="glass card-pop rounded-2xl p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold">Zone fill rate</h3>
                <div className="mt-4 space-y-3.5">
                  {ZONES.map((z) => {
                    const sold = zoneSold(stats, sim, z.id);
                    const fill = Math.min(100, Math.round((sold / z.capacity) * 100));
                    const left = Math.max(0, z.capacity - sold);
                    return (
                      <div key={z.id}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-semibold">{z.short}</span>
                          <span className="text-muted-foreground">
                            {fill}% • <span className="font-semibold text-racing">{left.toLocaleString("en-IN")} left</span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/10">
                          <AnimatedNumberWrap fill={fill} color={z.color} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedNumberWrap({ fill, color }: { fill: number; color: string }) {
  return (
    <motion.div
      className="h-full rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(3, fill)}%` }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
    />
  );
}
