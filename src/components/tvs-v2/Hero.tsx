"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Lock,
  MousePointerClick,
  Move3d,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { TARGET, formatINR, formatNum } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import { AnimatedNumber } from "./AnimatedNumber";
import type { StatsData } from "@/lib/tvs/types";

const Bike3D = dynamic(() => import("./Bike3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-racing/20 border-t-racing" />
        <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-muted-foreground">
          ROLLING THE BIKE INTO THE STUDIO…
        </span>
      </div>
    </div>
  ),
});

const spring = { type: "spring", stiffness: 110, damping: 18 } as const;

export function Hero({ stats }: { stats: StatsData | null }) {
  const previewName = useClaimStore((s) => s.previewName);
  const setPreviewName = useClaimStore((s) => s.setPreviewName);
  const claimedCode = useClaimStore((s) => s.claimedCode);

  const raised = stats?.totalRaised ?? 0;
  const pct = stats?.progressPct ?? 0;
  const contributors = stats?.contributorCount ?? 0;

  return (
    <section id="top" className="relative overflow-hidden pt-16">
      {/* bright showroom backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(75%_60%_at_50%_30%,black,transparent)]" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-racing/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 rounded-full bg-volt-bright/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_1.1fr] lg:gap-6">
          {/* ── copy column ── */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="inline-flex items-center gap-2 rounded-full border border-volt/25 bg-white px-3.5 py-1.5 card-pop"
            >
              <span className="relative flex h-2 w-2">
                <span className="ping-slow absolute inline-flex h-2 w-2 rounded-full bg-volt-bright opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
              </span>
              <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-ink">
                EXPERIMENT #01 • 100% COMMUNITY OWNED
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.06 }}
              className="mt-5 font-display text-[2.5rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Own a Piece of a{" "}
              <span className="relative whitespace-nowrap text-racing">
                38 HP
                <svg
                  className="absolute -bottom-1.5 left-0 w-full"
                  viewBox="0 0 120 8"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 6 Q 30 1 60 4 T 118 3"
                    stroke="#e11d48"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              Track Weapon for Just{" "}
              <span className="bg-[linear-gradient(120deg,#f43f5e,#be123c)] bg-clip-text text-transparent">
                ₹10.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.12 }}
              className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base"
            >
              The internet is buying a{" "}
              <strong className="font-semibold text-ink">
                top-spec TVS Apache RR 310 (BTO Racing Edition, aero winglets)
              </strong>{" "}
              — ₹10 at a time. Every contributor&apos;s name gets{" "}
              <strong className="font-semibold text-ink">permanently printed</strong> on the
              physical wrap. Rotate the bike, tap a part, claim your real estate.
            </motion.p>

            {/* endowment hook: live name on the bike */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.18 }}
              className="mt-6 rounded-2xl border border-racing/20 bg-gradient-to-br from-white to-accent/60 p-4 card-pop"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-racing" />
                <span className="font-mono text-[10.5px] font-bold tracking-[0.16em] text-racing">
                  TRY IT LIVE — WATCH YOUR NAME LAND ON THE BIKE
                </span>
              </div>
              <div className="mt-2.5 flex gap-2">
                <input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value.slice(0, 25))}
                  maxLength={25}
                  placeholder="Type your name…"
                  aria-label="Preview your name on the bike wrap"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing/50 focus:ring-4 focus:ring-racing/10"
                />
                <button
                  onClick={() => openZones()}
                  className="btn-racing h-11 shrink-0 rounded-xl px-4 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  Lock it in
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                {claimedCode ? (
                  <>
                    <BadgeCheck className="h-3.5 w-3.5 text-volt" />
                    <span>
                      Locked as{" "}
                      <strong className="font-semibold text-ink">{claimedCode}</strong> — it&apos;s
                      going on the wrap.
                    </span>
                  </>
                ) : previewName.trim() ? (
                  <>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-volt" />
                    <span>
                      <strong className="font-semibold text-ink">
                        {previewName.trim().toUpperCase()}
                      </strong>{" "}
                      is now on the tank, fairing &amp; tail. Like how it looks?
                    </span>
                  </>
                ) : (
                  <>
                    <MousePointerClick className="h-3.5 w-3.5" />
                    <span>Type above — the decals on the bike update in real time.</span>
                  </>
                )}
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.24 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => openZones()}
                className="btn-racing group inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-bold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                <Zap className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                Claim Your Spot on the Bike (From ₹10)
              </button>
              <a
                href="#proof"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-[15px] font-semibold text-ink transition hover:border-black/20 hover:bg-secondary"
              >
                How the money works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-volt" /> Locked public ledger
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-bolt" /> No middlemen, ever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-racing" /> Weekly statement drops
              </span>
            </motion.div>
          </div>

          {/* ── 3D bike stage ── */}
          <motion.div
            id="bike"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.15 }}
            className="relative scroll-mt-24"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[radial-gradient(120%_100%_at_50%_0%,#ffffff_0%,#eef1f5_58%,#e6e9ef_100%)] p-2 card-pop-lg sm:p-3">
              {/* halftone + stripes decor */}
              <div className="halftone pointer-events-none absolute right-6 top-6 h-24 w-28 opacity-70" />
              <div className="racing-stripes pointer-events-none absolute -left-10 bottom-24 h-3 w-40 -rotate-12 rounded-full opacity-80" />

              <div className="relative h-[380px] sm:h-[460px] lg:h-[540px]">
                <Bike3D />
              </div>

              {/* floating spec chips */}
              <div className="float-tag pointer-events-none absolute left-5 top-5 hidden rounded-xl border border-black/[0.06] bg-white/85 px-3 py-2 backdrop-blur sm:block">
                <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
                  ENGINE
                </div>
                <div className="tnum font-display text-sm font-bold text-ink">312.12cc • 38 HP</div>
              </div>
              <div
                className="float-tag pointer-events-none absolute right-5 top-5 hidden rounded-xl border border-black/[0.06] bg-white/85 px-3 py-2 backdrop-blur sm:block"
                style={{ animationDelay: "-1.6s" }}
              >
                <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
                  0–60 KM/H
                </div>
                <div className="tnum font-display text-sm font-bold text-ink">3.29 s</div>
              </div>

              {/* drag hint */}
              <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
                <div className="glass-strong flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-sm">
                  <Move3d className="h-3.5 w-3.5 text-racing" />
                  <span className="whitespace-nowrap font-mono text-[10px] font-bold tracking-[0.14em] text-ink">
                    DRAG TO ROTATE • TAP A PART TO CLAIM IT
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── progress + stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.32 }}
          className="mt-10 rounded-3xl border border-black/[0.07] bg-white p-5 card-pop sm:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[10.5px] font-bold tracking-[0.18em] text-muted-foreground">
                LIVE FUNDING TELEMETRY
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <AnimatedNumber
                  value={raised}
                  format="inr"
                  className="tnum font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                />
                <span className="tnum font-mono text-sm font-semibold text-muted-foreground">
                  / {formatINR(TARGET)}
                </span>
              </div>
            </div>
            <div className="flex gap-6 sm:gap-8">
              <Stat label="TRACK LOCKED" value={`${pct.toFixed(1)}%`} accent />
              <Stat label="CONTRIBUTORS" value={formatNum(contributors)} />
              <Stat
                label="CLAIMED TODAY"
                value={formatNum(Math.min(contributors, stats?.recent.length ?? 0))}
                hint="last 24h window"
              />
            </div>
          </div>
          <div className="relative mt-4 h-4 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="progress-shimmer relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#f43f5e_0%,#e11d48_55%,#be123c_100%)]"
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px] font-semibold tracking-wide text-muted-foreground">
            <span className="tnum">{formatINR(raised)} IN</span>
            <span className="tnum">{formatINR(Math.max(0, TARGET - raised))} TO GO — 62.9% OPEN REAL ESTATE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function openZones() {
  document.getElementById("zones")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`tnum font-display text-lg font-bold sm:text-xl ${
          accent ? "text-racing" : "text-ink"
        }`}
      >
        {value}
      </div>
      {hint ? <div className="text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
