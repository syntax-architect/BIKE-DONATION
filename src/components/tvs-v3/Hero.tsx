"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Flame, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { TARGET, formatINR } from "@/lib/tvs/constants";
import { HERO_ANGLES } from "@/lib/tvs/v3";
import { nextMilestone } from "@/lib/tvs/psych";
import { AnimatedNumber } from "./AnimatedNumber";
import { VinylSticker } from "./VinylSticker";
import { totalRaised, totalBackers, useLiveStore, useClaimStore } from "@/lib/tvs/store";

const AVATAR_COLORS = ["#E11D48", "#059669", "#0284C7", "#D97706", "#7C3AED", "#DB2777"];

function Avatars({ count }: { count: number }) {
  return (
    <div className="flex -space-x-2.5">
      {AVATAR_COLORS.map((c, i) => (
        <span
          key={i}
          className="grid h-8 w-8 place-items-center rounded-full border-2 border-background text-[10px] font-bold text-white"
          style={{ background: c }}
        >
          {["A", "P", "D", "S", "R", "M"][i]}
        </span>
      ))}
      <span className="grid h-8 place-items-center rounded-full border-2 border-background bg-foreground px-2 text-[10px] font-bold text-background">
        {(count / 1000).toFixed(1)}k
      </span>
    </div>
  );
}

export function Hero() {
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const openClaim = useClaimStore((s) => s.openClaim);
  const previewName = useClaimStore((s) => s.previewName);
  const setPreviewName = useClaimStore((s) => s.setPreviewName);
  const previewHandle = useClaimStore((s) => s.previewHandle);
  const [angleIdx, setAngleIdx] = useState(0);

  const raised = totalRaised(stats, sim);
  const backers = totalBackers(stats, sim);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const avg = backers > 0 ? Math.round(raised / backers) : 20;
  const ms = nextMilestone(raised);
  const activeAngle = HERO_ANGLES[angleIdx] ?? HERO_ANGLES[0];
  const hasTypedName = previewName.trim().length >= 2;

  const quickLock = (amt: 10 | 20) => {
    openClaim("BELLY", amt, hasTypedName ? "pay" : "details");
  };

  return (
    <section id="top" className="relative overflow-hidden pt-14 sm:pt-16">
      {/* backdrop flourishes */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-racing/15 blur-[120px] dark:bg-racing/25" />
        <div className="absolute left-[-8%] top-1/3 h-[360px] w-[360px] rounded-full bg-volt-bright/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          {/* ── copy ── */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-racing" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-racing" />
              </span>
              Experiment #01 • 100% Community Owned
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-display text-[2.5rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.2rem]"
            >
              Own a piece of a{" "}
              <span className="text-glow-red bg-gradient-to-r from-racing via-racing-soft to-racing bg-clip-text text-transparent">
                38 HP
              </span>{" "}
              track weapon for just{" "}
              <span className="relative inline-block text-racing">
                ₹10
                <svg
                  className="absolute -bottom-1 left-0 w-full sm:-bottom-2"
                  viewBox="0 0 120 10"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 8C30 2.5 70 2 118 6.5"
                    stroke="#E11D48"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              The internet is buying a{" "}
              <strong className="font-semibold text-foreground">
                real TVS Apache RR 310
              </strong>{" "}
              — and every contributor&rsquo;s name gets permanently printed on the
              actual bike. One UPI payment. One square of vinyl.{" "}
              <strong className="font-semibold text-foreground">
                Your name on a superbike, forever.
              </strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="glass card-pop mt-6 max-w-xl rounded-2xl border-racing/25 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-racing">
                  <Sparkles className="h-3.5 w-3.5" />
                  Try it live — see your name on the RR 310
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {hasTypedName ? "1-tap UPI QR ready" : "Instant preview"}
                </span>
              </div>

              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value.slice(0, 25))}
                  maxLength={25}
                  placeholder="Type your name (e.g. Rohan)…"
                  aria-label="Preview your name on the Apache RR 310"
                  className="h-11 min-w-0 flex-1 rounded-xl border bg-background/80 px-3.5 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20"
                />
                <button
                  type="button"
                  onClick={() => quickLock(20)}
                  className="btn-racing inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4" />
                  Lock for ₹20
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                    4 cm²
                  </span>
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => quickLock(10)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-racing/30 bg-racing/8 px-3 py-1 text-xs font-bold text-racing transition-colors hover:bg-racing hover:text-white"
                  >
                    <Flame className="h-3 w-3" />
                    Just ₹10 (1 chai • 2 cm²)
                  </button>
                  <a
                    href="#bike"
                    className="inline-flex items-center gap-1 rounded-full border bg-card/70 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Explore RR 310 <ArrowDown className="h-3 w-3" />
                  </a>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {hasTypedName ? "Looks clean — lock it before it's gone" : "Updates live on the bike →"}
                </span>
              </div>
            </motion.div>

            {/* social proof row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              <Avatars count={backers} />
              <div className="text-sm">
                <span className="font-semibold">{backers.toLocaleString("en-IN")} strangers</span>{" "}
                <span className="text-muted-foreground">already put their name on it</span>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-volt-bright" />
                  Public ledger • Every rupee traceable
                </div>
              </div>
            </motion.div>

            {/* live progress pill */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass card-pop mt-7 max-w-xl rounded-2xl p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  <AnimatedNumber value={raised} currency />
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    / {TARGET.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="rounded-full bg-volt/10 px-2.5 py-1 text-xs font-bold text-volt dark:bg-volt-bright/10 dark:text-volt-bright">
                  {pct}% TRACK LOCKED
                </span>
              </div>
              <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="progress-shimmer relative h-full overflow-hidden rounded-full bg-gradient-to-r from-racing to-racing-soft"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
                {[25, 50, 75].map((m) => (
                  <span
                    key={m}
                    className="absolute top-0 h-full w-px bg-background/70"
                    style={{ left: `${m}%` }}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-racing" />
                  {backers.toLocaleString("en-IN")} backers • avg ₹{avg}
                </span>
                <span>
                  {ms.remaining > 0 ? (
                    <>
                      Next: <strong className="text-foreground">{ms.next.label}</strong> (
                      {ms.doubleSpots.toLocaleString("en-IN")} × ₹20 spots left)
                    </>
                  ) : (
                    <strong className="text-volt-bright">All milestones unlocked!</strong>
                  )}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── real bike stage ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="stage glow-red card-pop-lg relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
              {activeAngle.cutout ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 pb-32 pt-14 sm:px-8 sm:pb-36 sm:pt-16">
                  <div className="relative h-full w-full">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-[12%] bottom-1 h-7 rounded-full bg-black/80 blur-xl"
                    />
                    <Image
                      src={activeAngle.src}
                      alt={`Real TVS Apache RR 310 BTO — ${activeAngle.label}`}
                      fill
                      priority
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 560px, 520px"
                      className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.75)] transition-opacity duration-300"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={activeAngle.src}
                    alt={`Real TVS Apache RR 310 BTO — ${activeAngle.label}`}
                    fill
                    priority
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 560px, 520px"
                    className="object-cover object-center transition-opacity duration-300"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050507] via-[#050507]/75 to-transparent"
                  />
                </>
              )}
              {/* live badge + angle selector */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-racing-soft" />
                  Apache RR 310
                </div>
                <div className="flex items-center gap-1 rounded-full bg-black/55 p-1 backdrop-blur">
                  {HERO_ANGLES.map((a, idx) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAngleIdx(idx)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        idx === angleIdx
                          ? "bg-racing text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* floating spec chips */}
              <div className="float-tag glass absolute left-4 top-[18%] hidden rounded-xl px-3 py-2 text-xs backdrop-blur sm:block" style={{ background: "rgba(13,15,21,0.55)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="font-display text-base font-bold text-white">38 HP</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">Peak power</div>
              </div>
              <div className="float-tag glass absolute right-4 top-[22%] hidden rounded-xl px-3 py-2 text-xs backdrop-blur sm:block" style={{ animationDelay: "-1.2s", background: "rgba(13,15,21,0.55)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="font-display text-base font-bold text-white">29 Nm</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">Torque</div>
              </div>
              <div className="float-tag glass absolute left-5 top-[48%] hidden rounded-xl px-3 py-2 text-xs backdrop-blur sm:block" style={{ animationDelay: "-2.1s", background: "rgba(13,15,21,0.55)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="font-display text-base font-bold text-white">312.2 cc</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">Reverse-inclined</div>
              </div>
              <div className="float-tag glass absolute right-5 top-[44%] hidden rounded-xl px-3 py-2 text-xs backdrop-blur sm:block" style={{ animationDelay: "-0.6s", background: "rgba(13,15,21,0.55)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="font-display text-base font-bold text-white">174 kg</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">Kerb weight</div>
              </div>

              {/* live vinyl sticker preview pinned on the bike */}
              <div className="pointer-events-none absolute inset-x-4 bottom-[86px] flex justify-center sm:bottom-[92px]">
                <VinylSticker
                  name={previewName}
                  handle={previewHandle}
                  zone="BELLY"
                  amount={20}
                  isPlaceholder={!hasTypedName}
                  className="w-full max-w-[270px] -rotate-1"
                />
              </div>

              {/* bottom caption */}
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/55 p-3.5 backdrop-blur">
                <p className="text-xs leading-relaxed text-white/85 sm:text-sm">
                  <span className="font-bold text-white">TVS Apache RR 310 BTO Racing Edition.</span>{" "}
                  Target {formatINR(TARGET)} • Tap any panel below to print your name on it.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
