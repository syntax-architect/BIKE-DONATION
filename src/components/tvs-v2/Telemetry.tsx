"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Crown,
  FileLock2,
  Flag,
  Layers,
  Printer,
  Rocket,
  Wind,
} from "lucide-react";
import {
  COST_BREAKDOWN,
  TARGET,
  ZONE_MAP,
  formatINR,
} from "@/lib/tvs/constants";
import { MILESTONES, momentum, timeAgo } from "@/lib/tvs/psych";
import { useClaimStore } from "@/lib/tvs/store";
import { AnimatedNumber } from "./AnimatedNumber";
import { Reveal, SectionHead } from "./Reveal";
import type { StatsData } from "@/lib/tvs/types";

const MILESTONE_ICONS = {
  flag: Flag,
  wind: Wind,
  "badge-check": BadgeCheck,
  printer: Printer,
  rocket: Rocket,
} as const;

export function Telemetry({ stats }: { stats: StatsData | null }) {
  const raised = stats?.totalRaised ?? 0;
  const pct = stats?.progressPct ?? 0;
  const { todayCount, avg } = momentum(
    stats ?? { totalRaised: raised, contributorCount: 0, recent: [] },
  );
  const nextMs = MILESTONES.find((m) => m.at > raised);

  return (
    <section id="proof" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          kicker="LIVE TELEMETRY & SOCIAL PROOF"
          title={
            <>
              Watch the internet{" "}
              <span className="text-racing">buy this bike in public.</span>
            </>
          }
          sub="No dark pool, no silent middlemen — every rupee lands in a locked public ledger with weekly statements. These are the gates the community unlocks next."
        />

        {/* ── milestone track ── */}
        <Reveal className="mt-10">
          <div className="rounded-3xl border border-black/[0.07] bg-white p-6 card-pop sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-racing">
                  <Flag className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="font-display text-lg font-bold text-ink">
                    Community Unlock Gates
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    Goal-gradient in action — each gate makes the bike more real.
                  </div>
                </div>
              </div>
              {nextMs ? (
                <div className="rounded-full border border-volt/25 bg-volt-bright/10 px-3.5 py-1.5 text-center font-mono text-[11px] font-bold text-volt">
                  NEXT GATE: {formatINR(nextMs.at)} — {formatINR(nextMs.at - raised)} TO GO
                </div>
              ) : (
                <div className="rounded-full bg-volt px-3.5 py-1.5 font-mono text-[11px] font-bold text-white">
                  ALL GATES CLEARED — SEE YOU AT THE LIVESTREAM
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {MILESTONES.map((m, i) => {
                const Icon = MILESTONE_ICONS[m.icon];
                const done = raised >= m.at;
                const active = !done && i === MILESTONES.findIndex((x) => x.at > raised);
                return (
                  <motion.div
                    key={m.at}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className={`relative rounded-2xl border p-4 ${
                      done
                        ? "border-volt/30 bg-volt-bright/[0.08]"
                        : active
                          ? "border-racing/35 bg-accent/60"
                          : "border-black/[0.07] bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          done
                            ? "bg-volt text-white"
                            : active
                              ? "bg-racing text-white"
                              : "bg-white text-muted-foreground shadow-sm"
                        }`}
                      >
                        {done ? <BadgeCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className="tnum font-mono text-[10px] font-bold tracking-wide text-muted-foreground">
                        {formatINR(m.at)}
                      </span>
                    </div>
                    <div className="mt-2.5 text-[13px] font-bold leading-snug text-ink">
                      {m.label}
                    </div>
                    <div className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                      {m.desc}
                    </div>
                    {done ? (
                      <div className="mt-2 font-mono text-[9.5px] font-bold tracking-[0.14em] text-volt">
                        ✓ UNLOCKED
                      </div>
                    ) : active ? (
                      <div className="mt-2 font-mono text-[9.5px] font-bold tracking-[0.14em] text-racing">
                        ▲ IN PROGRESS
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* ── transparency ledger ── */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-black/[0.07] bg-white p-6 card-pop sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bolt-bright/15 text-bolt">
                  <FileLock2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="font-display text-lg font-bold text-ink">
                    100% Transparency Ledger
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    Where every rupee of the ₹4,00,000 target goes.
                  </div>
                </div>
              </div>

              <div className="mt-5 flex-1 space-y-4">
                {COST_BREAKDOWN.map((c) => {
                  const share = (c.amount / TARGET) * 100;
                  const icon =
                    c.icon === "bike" ? "🏍️" : c.icon === "file" ? "📄" : "🎨";
                  return (
                    <div key={c.label}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13.5px] font-semibold text-ink">
                          {icon} {c.label}
                        </span>
                        <span className="tnum font-mono text-[13px] font-bold text-ink">
                          {formatINR(c.amount)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${share}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-[linear-gradient(90deg,#f43f5e,#be123c)]"
                        />
                      </div>
                      <div className="mt-1 text-[11.5px] text-muted-foreground">{c.note}</div>
                    </div>
                  );
                })}
                <div className="flex items-baseline justify-between border-t border-dashed border-black/10 pt-4">
                  <span className="font-display text-[15px] font-bold text-ink">
                    Total target — wrap day
                  </span>
                  <span className="tnum font-display text-xl font-bold text-racing">
                    {formatINR(TARGET)}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Hall of Fame ── */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-3xl border border-vip-bright/30 bg-gradient-to-b from-amber-50/80 to-white p-6 card-pop sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-vip-bright text-white">
                  <Crown className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="font-display text-lg font-bold text-ink">Hall of Fame</div>
                  <div className="text-[12px] text-muted-foreground">
                    Top 10 largest contributors — pinned forever.
                  </div>
                </div>
              </div>

              <ol className="mt-5 max-h-[340px] flex-1 space-y-2 overflow-y-auto pr-1">
                {(stats?.top ?? []).map((t, i) => {
                  const z = ZONE_MAP[t.zone as keyof typeof ZONE_MAP];
                  return (
                    <motion.li
                      key={t.id}
                      initial={{ opacity: 0, x: 14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white px-3.5 py-2.5"
                    >
                      <span
                        className={`tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                          i === 0
                            ? "bg-vip-bright text-white"
                            : i < 3
                              ? "bg-racing/10 text-racing"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-bold text-ink">
                          {t.name}
                          {t.handle ? (
                            <span className="ml-1 font-normal text-muted-foreground">
                              {t.handle}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {z?.label ?? t.zone} · {timeAgo(t.createdAt)}
                        </div>
                      </div>
                      <span className="tnum font-mono text-[13px] font-bold text-ink">
                        {formatINR(t.amount)}
                      </span>
                    </motion.li>
                  );
                })}
                {(!stats || stats.top.length === 0) && (
                  <li className="py-8 text-center text-[13px] text-muted-foreground">
                    Loading the hall of fame…
                  </li>
                )}
              </ol>
            </div>
          </Reveal>
        </div>

        {/* ── momentum strip ── */}
        <Reveal className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MomentumCard
              icon="🔥"
              label="Joined in the last 24h"
              value={formatIN(todayCount)}
              note="The swarm is active right now"
            />
            <MomentumCard
              icon="🤝"
              label="Average contribution"
              value={formatINR(avg)}
              note="Proof this is truly the people's bike"
            />
            <MomentumCard
              icon="🧾"
              label="Claims on the ledger"
              value={formatIN(stats?.contributorCount ?? 0)}
              note="Every one verified by UPI reference"
            />
          </div>
        </Reveal>

        {/* ── recent donor wall ── */}
        <Reveal className="mt-6">
          <div className="rounded-3xl border border-black/[0.07] bg-white p-6 card-pop sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-racing">
                <Layers className="h-4.5 w-4.5" />
              </span>
              <div>
                <div className="font-display text-lg font-bold text-ink">
                  Names Already Riding the Bike
                </div>
                <div className="text-[12px] text-muted-foreground">
                  Latest verified claims — this is the wrap, filling live.
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(stats?.recent ?? []).map((r) => {
                const z = ZONE_MAP[r.zone as keyof typeof ZONE_MAP];
                return (
                  <motion.span
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-secondary/60 py-1.5 pl-2.5 pr-3.5"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: z?.color ?? "#64748b" }}
                    />
                    <span className="text-[12.5px] font-bold text-ink">{r.name}</span>
                    <span className="tnum font-mono text-[11px] text-muted-foreground">
                      {formatINR(r.amount)}
                    </span>
                  </motion.span>
                );
              })}
              {(!stats || stats.recent.length === 0) && (
                <span className="py-2 text-[13px] text-muted-foreground">
                  Loading the swarm…
                </span>
              )}
            </div>
            <div className="mt-5 rounded-2xl bg-[linear-gradient(120deg,#fff1f3,#f8fafc)] p-4">
              <p className="text-[13px] leading-relaxed text-ink">
                <strong className="font-bold">Your name goes here next.</strong> ₹10 is one chai —
                and in return your handle rides a 38 HP machine, in 4K footage, forever.{" "}
                <CloseQuote onPick={() => useClaimStore.getState().openClaim()} />
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CloseQuote({ onPick }: { onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="font-bold text-racing underline decoration-racing/30 underline-offset-2 transition hover:decoration-racing"
    >
      Claim your slot →
    </button>
  );
}

function formatIN(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function MomentumCard({
  icon,
  label,
  value,
  note,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.07] bg-white p-5 card-pop">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
          {label.toUpperCase()}
        </span>
      </div>
      <div className="tnum mt-2 font-display text-2xl font-bold tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{note}</div>
    </div>
  );
}
