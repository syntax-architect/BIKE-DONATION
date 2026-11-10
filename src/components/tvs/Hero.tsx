"use client";

import { motion } from "framer-motion";
import { ChevronDown, ShieldCheck, Users, Zap } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { TARGET, formatINR, formatNum } from "@/lib/tvs/constants";
import type { StatsData } from "@/lib/tvs/types";

const WRAP_DAY = new Date("2026-12-20T10:00:00+05:30");

function daysToWrap(): number {
  const ms = WRAP_DAY.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ stats }: { stats: StatsData | null }) {
  const total = stats?.totalRaised ?? 0;
  const pct = stats ? Math.min(100, (stats.totalRaised / stats.target) * 100) : 0;
  const contributors = stats?.contributorCount ?? 0;

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* backdrop */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-racing/14 blur-[140px] pointer-events-none" />
      <div className="absolute top-40 -right-32 w-[420px] h-[420px] rounded-full bg-bolt/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-volt opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-volt" />
            </span>
            <span className="font-mono text-[10.5px] md:text-[11px] tracking-[0.26em] text-zinc-300">
              EXPERIMENT #01 &nbsp;•&nbsp; 100% COMMUNITY OWNED
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="mt-7 font-display font-bold tracking-tight text-zinc-50 leading-[1.02] text-[2.35rem] sm:text-5xl md:text-[4.35rem]"
          >
            Own a Piece of a{" "}
            <span className="relative inline-block text-racing-soft text-glow-red italic">
              38&nbsp;HP
            </span>{" "}
            Track Weapon for Just{" "}
            <span className="relative inline-block text-volt text-glow-volt">
              ₹10
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 120 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7 C 30 2, 60 8, 118 4"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          {/* subhead */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease }}
            className="mt-7 mx-auto max-w-2xl text-zinc-400 text-[15px] md:text-lg leading-relaxed"
          >
            We are putting the top-spec{" "}
            <span className="text-zinc-200 font-medium">TVS Apache RR 310</span> (BTO Racing
            Edition with Aero Winglets) on the asphalt. Every contributor gets their name or
            handle <span className="text-zinc-100 font-medium">permanently printed on the physical custom wrap</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <motion.a
              href="#zones"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 17 }}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-racing px-7 py-4 text-[15px] font-bold text-white shadow-[0_0_44px_rgba(225,29,72,0.45)] hover:shadow-[0_0_64px_rgba(225,29,72,0.6)] transition-shadow"
            >
              <Zap className="w-5 h-5" strokeWidth={2.5} />
              Claim Your Spot on the Bike
              <span className="font-mono text-[12px] font-medium text-white/75">(From ₹10)</span>
            </motion.a>
            <motion.a
              href="#promise"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 17 }}
              className="inline-flex items-center gap-2 rounded-xl glass px-6 py-4 text-[14px] font-semibold text-zinc-200 hover:bg-white/8 transition-colors"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-volt" />
              Read the Promise
            </motion.a>
          </motion.div>

          {/* live counter pill */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.46, ease }}
            className="mt-11 mx-auto max-w-2xl"
          >
            <div className="glass rounded-2xl px-5 py-4 md:px-7 md:py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[12px] md:text-[13.5px]">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-racing-soft opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-racing" />
                </span>
                <AnimatedNumber
                  value={total}
                  format={(v) => formatINR(Math.round(v))}
                  className="text-zinc-50 font-bold tnum"
                />
                <span className="text-zinc-500">/ {formatINR(TARGET)} RAISED</span>
                <span className="text-zinc-700">•</span>
                <span className="text-volt font-bold tnum">
                  {pct > 0 ? pct.toFixed(1) : "37.1"}% TRACK LOCKED
                </span>
              </div>
              <div className="mt-3.5 h-2.5 rounded-full bg-white/6 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-racing via-racing-soft to-racing progress-shimmer relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(3, pct)}%` }}
                  transition={{ duration: 1.4, delay: 0.6, ease }}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[10.5px] tracking-wider text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-bolt" />
                  <AnimatedNumber value={contributors} className="text-zinc-300 tnum" /> STRANGERS
                  ON BOARD
                </span>
                <span>WRAP DAY IN {daysToWrap()} DAYS</span>
                <span>{formatNum(Math.max(0, TARGET - total))} TO GO</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* scroll hint */}
      <motion.a
        href="#zones"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-14 flex flex-col items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Scroll to zone selector"
      >
        <span className="font-mono text-[10px] tracking-[0.34em]">PICK YOUR TERRITORY</span>
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
