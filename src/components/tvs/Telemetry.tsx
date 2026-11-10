"use client";

import { motion } from "framer-motion";
import {
  Bike,
  Crown,
  FileText,
  Layers,
  Lock,
  Medal,
  Trophy,
  Users,
} from "lucide-react";
import { Reveal, SectionHeader } from "./Reveal";
import {
  COST_BREAKDOWN,
  ZONE_MAP,
  TARGET,
  formatINR,
  formatNum,
  type ZoneId,
} from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { ClaimRecord, StatsData } from "@/lib/tvs/types";

const RANK_BADGES: Record<number, { label: string; color: string }> = {
  1: { label: "👑 TITLE SPONSOR", color: "#F59E0B" },
  2: { label: "AERO BARON", color: "#38BDF8" },
  3: { label: "PODIUM CREW", color: "#10B981" },
};

function badgeFor(rank: number, zone: string) {
  if (RANK_BADGES[rank]) return RANK_BADGES[rank];
  const z = ZONE_MAP[zone as ZoneId];
  return { label: z?.tierName.toUpperCase() ?? "SUPPORTER", color: z?.color ?? "#A1A1AA" };
}

function HallOfFame({ top }: { top: ClaimRecord[] }) {
  const openClaim = useClaimStore((s) => s.openClaim);

  return (
    <div id="hall" className="scroll-mt-24 rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-vip/15 text-vip">
            <Trophy className="w-4 h-4" />
          </span>
          <div>
            <div className="font-display text-[15px] font-bold text-zinc-50">Hall of Fame</div>
            <div className="font-mono text-[9px] tracking-[0.24em] text-zinc-600">TOP 10 CONTRIBUTORS</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-volt/10 border border-volt/30 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.18em] text-volt">
          <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse" /> LIVE
        </span>
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {top.map((c, i) => {
          const rank = i + 1;
          const zone = ZONE_MAP[c.zone as ZoneId];
          const badge = badgeFor(rank, c.zone);
          const medalColor = rank === 1 ? "#F59E0B" : rank === 2 ? "#C0C0C8" : rank === 3 ? "#CD7F32" : "#3f3f46";
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center gap-3 px-5 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors"
            >
              <span className="w-7 shrink-0 font-mono text-[13px] font-bold tnum" style={{ color: medalColor }}>
                {String(rank).padStart(2, "0")}
              </span>
              {rank <= 3 ? (
                <Medal className="w-4 h-4 shrink-0" style={{ color: medalColor }} />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-zinc-100">{c.name}</span>
                  {c.handle && <span className="hidden sm:inline truncate font-mono text-[10.5px] text-zinc-600">{c.handle}</span>}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[8.5px] font-bold tracking-[0.12em]"
                    style={{ background: `${badge.color}1a`, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                  <span className="font-mono text-[9.5px] text-zinc-600">{zone?.short.toUpperCase()}</span>
                </div>
              </div>
              <span className="font-mono text-[14px] font-bold text-zinc-50 tnum">{formatINR(c.amount)}</span>
            </motion.div>
          );
        })}

        {/* YOU row */}
        <button
          onClick={() => openClaim("BELLY", 10)}
          className="group flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
        >
          <span className="w-7 shrink-0 font-mono text-[13px] font-bold text-zinc-700 tnum">11</span>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
              Your name here →
            </div>
            <div className="font-mono text-[9.5px] text-zinc-700 mt-0.5">FROM JUST ₹10</div>
          </div>
          <span className="rounded-lg border border-dashed border-white/15 px-3 py-1.5 font-mono text-[10px] text-zinc-400 group-hover:border-racing/60 group-hover:text-racing-soft transition-colors">
            CLAIM
          </span>
        </button>
      </div>
    </div>
  );
}

function Transparency() {
  const icons = { bike: Bike, file: FileText, layers: Layers } as const;
  const pct = (n: number) => Math.round((n / TARGET) * 1000) / 10;

  return (
    <div id="transparency" className="scroll-mt-24 rounded-3xl border border-white/8 bg-white/[0.02] p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-bolt/15 text-bolt">
          <Lock className="w-4 h-4" />
        </span>
        <div>
          <div className="font-display text-[15px] font-bold text-zinc-50">100% Transparency</div>
          <div className="font-mono text-[9px] tracking-[0.24em] text-zinc-600">WHERE EVERY RUPEE GOES</div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {COST_BREAKDOWN.map((row, i) => {
          const Icon = icons[row.icon as keyof typeof icons];
          return (
            <div key={row.label}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-white/5 text-zinc-300">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-zinc-200">{row.label}</div>
                    <div className="mt-0.5 text-[11px] text-zinc-600">{row.note}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[14px] font-bold text-zinc-100 tnum">{formatINR(row.amount)}</div>
                  <div className="font-mono text-[10px] text-zinc-600 tnum">{pct(row.amount)}%</div>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-white/6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-racing to-racing-soft"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct(row.amount)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between rounded-xl border border-volt/25 bg-volt/[0.06] px-4 py-3.5">
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] text-zinc-500">TOTAL TARGET</div>
          <div className="mt-0.5 text-[12px] text-zinc-400">Bike on road + fully wrapped</div>
        </div>
        <div className="font-display text-[22px] font-bold text-volt tnum">{formatINR(TARGET)}</div>
      </div>

      <p className="mt-4 font-mono text-[9.5px] tracking-wider leading-relaxed text-zinc-600">
        * PUBLIC LEDGER STATEMENTS DROP EVERY FRIDAY. UNSPENT RUPEES STAY LOCKED & REFUNDABLE.
      </p>
    </div>
  );
}

export function Telemetry({ stats }: { stats: StatsData | null }) {
  return (
    <section id="telemetry" className="relative py-20 md:py-28 scroll-mt-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          index="04"
          kicker="Live Telemetry"
          title={
            <>
              The Grid Is{" "}
              <span className="text-bolt italic">Filling Up</span>
            </>
          }
          sub="Real names, real slots, real-time. The leaderboard and the ledger below update the moment a claim is verified."
        />

        <div className="grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <HallOfFame top={stats?.top ?? []} />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-2">
            <Transparency />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <Users className="w-4 h-4 text-bolt" />
                <div className="mt-2 font-display text-[22px] font-bold text-zinc-50 tnum">
                  {formatNum(stats?.contributorCount ?? 0)}
                </div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mt-0.5">CONTRIBUTORS</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <Crown className="w-4 h-4 text-vip" />
                <div className="mt-2 font-display text-[22px] font-bold text-zinc-50 tnum">
                  {formatNum(12 - (stats?.zones?.COWL?.sold ?? 0))}
                </div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mt-0.5">VIP COWL SLOTS LEFT</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
