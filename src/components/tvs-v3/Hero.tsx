"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Flame, Gauge, Heart, Link2, ShieldCheck, Sparkles, User, Zap } from "lucide-react";
import {
  CLAN_CITIES,
  FOUNDER_LIMIT,
  TARGET,
  formatINR,
  type ClaimMode,
} from "@/lib/tvs/constants";
import { playRevSound } from "@/lib/tvs/revSound";
import { HERO_ANGLES } from "@/lib/tvs/v3";
import { AnimatedNumber } from "./AnimatedNumber";
import { VinylSticker } from "./VinylSticker";
import { totalRaised, totalBackers, useLiveStore, useClaimStore } from "@/lib/tvs/store";

const MODES: Array<{ id: ClaimMode; label: string; shortLabel: string; icon: typeof Heart }> = [
  { id: "SOLO", label: "Solo Rider", shortLabel: "Solo", icon: User },
  { id: "COUPLE", label: "Bro / Couple Lock", shortLabel: "Couple", icon: Heart },
  { id: "PROMO", label: "Promote @Page", shortLabel: "@Page", icon: Link2 },
];

export function Hero() {
  const stats = useLiveStore((s) => s.stats);
  const openClaim = useClaimStore((s) => s.openClaim);
  const mode = useClaimStore((s) => s.mode);
  const setMode = useClaimStore((s) => s.setMode);
  const previewName = useClaimStore((s) => s.previewName);
  const setPreviewName = useClaimStore((s) => s.setPreviewName);
  const partnerName = useClaimStore((s) => s.partnerName);
  const setPartnerName = useClaimStore((s) => s.setPartnerName);
  const previewHandle = useClaimStore((s) => s.previewHandle);
  const setPreviewHandle = useClaimStore((s) => s.setPreviewHandle);
  const city = useClaimStore((s) => s.city);
  const setCity = useClaimStore((s) => s.setCity);
  const referrer = useClaimStore((s) => s.referrer);
  const setReferrer = useClaimStore((s) => s.setReferrer);

  const [angleIdx, setAngleIdx] = useState(0);
  const [revving, setRevving] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const revTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canTilt = useSyncExternalStore(
    useCallback((cb: () => void) => {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    }, []),
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false,
  );

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (!canTilt || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 5);
    rx.set(-py * 4);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const by = params.get("by")?.trim().slice(0, 25);
    if (by) setReferrer(by);
    return () => {
      if (revTimeoutRef.current) clearTimeout(revTimeoutRef.current);
    };
  }, [setReferrer]);

  const triggerRev = () => {
    playRevSound();
    setRevving(true);
    if (revTimeoutRef.current) clearTimeout(revTimeoutRef.current);
    revTimeoutRef.current = setTimeout(() => setRevving(false), 1150);
  };

  const raised = totalRaised(stats);
  const backers = totalBackers(stats);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const foundersLeft = stats?.foundersRemaining ?? Math.max(0, FOUNDER_LIMIT - backers);
  const isFounderOffer = foundersLeft > 0;
  const activeAngle = HERO_ANGLES[angleIdx] ?? HERO_ANGLES[0];

  const hasTypedName =
    previewName.trim().length >= 2 &&
    (mode !== "COUPLE" || partnerName.trim().length >= 2) &&
    (mode !== "PROMO" || previewHandle.trim().length >= 2);

  const quickLock = (amt: 10 | 20 | 50) => {
    const z = amt >= 50 ? "FAIRING" : "BELLY";
    openClaim(z, amt, hasTypedName ? "pay" : "details");
  };

  return (
    <section id="top" className="relative overflow-hidden pt-16 sm:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="animate-breathe-glow absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-racing/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        {referrer && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-volt/40 bg-volt/10 px-3.5 py-1.5 text-xs font-semibold text-volt sm:mb-5 sm:px-4 dark:text-volt-bright"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>{referrer}</strong> locked a tile on this RR 310 — claim yours next to theirs from ₹10!
            </span>
          </motion.div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[1.06fr_0.94fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5">
          {/* ── 1. Editorial header (first on mobile & top-left on desktop) ── */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-2">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-vip-bright/35 bg-vip/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-vip-bright sm:rounded-lg sm:py-1.5 sm:text-[11px]"
            >
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate sm:hidden">
                Founder #01 • 2× Area ({foundersLeft} open)
              </span>
              <span className="hidden sm:inline">
                FOUNDER BATCH #01 • First 500 Get 2× Vinyl Area + Clickable Social Link ({foundersLeft} open)
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-3 font-display text-[1.72rem] font-bold leading-[1.08] tracking-tight sm:mt-4 sm:text-5xl lg:text-[3.5rem]"
            >
              Lock your name, couple tag, or @page on a{" "}
              <span className="text-racing">38 HP</span> RR 310 for{" "}
              <span className="text-racing">₹10</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base"
            >
              Send your partner or best friend an official{" "}
              <strong className="font-semibold text-foreground">Couple / Bro Lock Certificate</strong>,
              buy a <strong className="font-semibold text-foreground">clickable @Instagram tile</strong>{" "}
              on the Wrap Wall, and get printed permanently on the TVS Apache RR 310 vinyl wrap.
            </motion.p>
          </div>

          {/* ── 2. Apache RR 310 stage with 3D tilt, rev easter-egg & angle crossfade ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
          >
            <div
              ref={stageRef}
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              className={`stage card-pop-lg relative mx-auto flex w-full max-w-[540px] flex-col overflow-hidden rounded-3xl transition-shadow duration-300 sm:block sm:aspect-[5/4] sm:rounded-[2rem] lg:aspect-[4/5] ${
                revving
                  ? "shadow-[0_0_110px_-10px_rgba(225,29,72,0.85)]"
                  : "glow-red"
              }`}
              style={{ perspective: 1200 }}
            >
              {/* breathing showroom spotlight aura */}
              <div
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-[44%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] transition-all duration-300 ${
                  revving ? "scale-125 bg-racing/50" : "animate-breathe-glow bg-racing/25"
                }`}
              />

              {/* clean top header, angle switcher & interactive Rev trigger */}
              <div className="z-10 flex flex-wrap items-center justify-between gap-2 px-3 pt-3 sm:absolute sm:inset-x-4 sm:top-4 sm:p-0">
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur sm:px-3 sm:tracking-[0.14em]">
                  <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" aria-hidden />
                  <span className="truncate sm:hidden">RR 310 BTO</span>
                  <span className="hidden sm:inline">TVS Apache RR 310 BTO</span>
                </span>
                <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-black/60 p-1 backdrop-blur sm:gap-1">
                  {HERO_ANGLES.map((a, idx) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAngleIdx(idx)}
                      className={`rounded-full px-2 py-1 text-[10px] font-bold transition-colors sm:px-2.5 ${
                        idx === angleIdx
                          ? "bg-racing text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={triggerRev}
                    title="Hear & feel the 312cc rev"
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition-all active:scale-95 sm:px-2.5 ${
                      revving
                        ? "bg-white text-racing"
                        : "bg-white/10 text-racing-soft hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <Gauge className="h-3 w-3 shrink-0" />
                    {revving ? "9,800 RPM" : "Rev"}
                  </button>
                </div>
              </div>

              {/* RPM sweep bar during rev */}
              <AnimatePresence>
                {revving && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-x-4 top-13 z-10 sm:inset-x-6 sm:top-16"
                  >
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15 backdrop-blur">
                      <motion.div
                        initial={{ width: "8%" }}
                        animate={{ width: ["12%", "96%", "78%", "25%"] }}
                        transition={{ duration: 1.05, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-volt-bright via-amber-400 to-racing"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* bike image / studio cutout */}
              <motion.div
                className="relative h-[190px] w-full sm:absolute sm:inset-0 sm:h-auto"
                style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
                animate={
                  revving
                    ? { x: [0, -2, 2, -2, 2, -1, 1, 0], y: [0, 1, -1, 1, -1, 0] }
                    : { x: 0, y: 0 }
                }
                transition={revving ? { duration: 0.45, repeat: 2 } : { duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAngle.id}
                    initial={{ opacity: 0, x: 22, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -22, scale: 0.97 }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {activeAngle.cutout ? (
                      <div className="absolute inset-0 flex items-center justify-center px-5 py-2 sm:px-8 sm:pb-36 sm:pt-16">
                        <div className="relative h-full w-full">
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-[12%] bottom-1 h-7 rounded-full bg-black/80 blur-xl"
                          />
                          <Image
                            src={activeAngle.src}
                            alt={`TVS Apache RR 310 BTO — ${activeAngle.label}`}
                            fill
                            priority
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 540px, 500px"
                            className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.75)]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-2 h-full w-full overflow-hidden sm:mt-0">
                        <Image
                          src={activeAngle.src}
                          alt={`TVS Apache RR 310 BTO — ${activeAngle.label}`}
                          fill
                          priority
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 540px, 500px"
                          className="object-cover object-center"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050507] via-[#050507]/65 to-transparent sm:h-40 sm:via-[#050507]/75"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* live vinyl decal preview */}
              <div className="pointer-events-none z-10 flex justify-center p-3 pt-1 sm:absolute sm:inset-x-4 sm:bottom-4 sm:p-0">
                <VinylSticker
                  name={previewName}
                  partnerName={partnerName}
                  handle={previewHandle}
                  city={city}
                  mode={mode}
                  zone={mode === "PROMO" ? "FAIRING" : "BELLY"}
                  amount={mode === "PROMO" ? 50 : 20}
                  isFounder={isFounderOffer}
                  isPlaceholder={!hasTypedName}
                  watermarked
                  className="w-full max-w-[330px]"
                />
              </div>
            </div>
          </motion.div>

          {/* ── 3. 3-Mode Sticker Configurator + Real Progress Bar ── */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="glass card-pop max-w-xl rounded-2xl border-racing/25 p-3.5 sm:p-4"
            >
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted/80 p-1">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`relative flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${
                        active ? "text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="hero-mode-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-lg bg-racing shadow-sm"
                        />
                      )}
                      <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                      <span className="relative z-10 truncate sm:hidden">{m.shortLabel}</span>
                      <span className="relative z-10 hidden truncate sm:inline">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value.slice(0, 25))}
                  maxLength={25}
                  placeholder={
                    mode === "COUPLE"
                      ? "Your name (e.g. Rohan)"
                      : mode === "PROMO"
                        ? "Creator / Brand name"
                        : "Your name (e.g. Ankit R.)"
                  }
                  aria-label="Primary name"
                  className="h-11 min-w-0 rounded-xl border bg-background/80 px-3 text-base font-semibold outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20 sm:h-10.5 sm:text-sm"
                />

                {mode === "COUPLE" ? (
                  <input
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value.slice(0, 25))}
                    maxLength={25}
                    placeholder="Partner or Bro's name (e.g. Priya)"
                    aria-label="Partner or best friend name"
                    className="h-11 min-w-0 rounded-xl border bg-background/80 px-3 text-base font-semibold outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20 sm:h-10.5 sm:text-sm"
                  />
                ) : (
                  <input
                    value={previewHandle}
                    onChange={(e) => setPreviewHandle(e.target.value.slice(0, 24))}
                    maxLength={24}
                    placeholder={
                      mode === "PROMO"
                        ? "@instagram, youtube, or x link"
                        : "@instagram or @x (clickable)"
                    }
                    aria-label="Social handle or URL"
                    className="h-11 min-w-0 rounded-xl border bg-background/80 px-3 font-mono text-base outline-none transition placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20 sm:h-10.5 sm:text-sm"
                  />
                )}
              </div>

              {mode === "COUPLE" && (
                <input
                  value={previewHandle}
                  onChange={(e) => setPreviewHandle(e.target.value.slice(0, 24))}
                  maxLength={24}
                  placeholder="Optional @instagram (clickable)"
                  aria-label="Optional social handle"
                  className="mt-2 h-10 w-full rounded-xl border bg-background/80 px-3 font-mono text-base outline-none transition placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-racing sm:h-9.5 sm:text-xs"
                />
              )}

              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="City or Clan"
                  className="h-10 w-full rounded-xl border bg-background/80 px-3 text-base font-semibold outline-none focus:border-racing sm:w-auto sm:text-xs"
                >
                  {CLAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      Turf: {c}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => quickLock(mode === "PROMO" ? 50 : 20)}
                  className="btn-racing inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white active:scale-[0.98] sm:h-10 sm:flex-1"
                >
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Unlock Story Pass + Print ({mode === "PROMO" ? "₹50" : "₹20"})
                  </span>
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => quickLock(10)}
                    className="inline-flex items-center gap-1 rounded-full border border-racing/30 bg-racing/8 px-2.5 py-1 text-[11px] font-bold text-racing transition-colors hover:bg-racing hover:text-white"
                  >
                    Start at ₹10 ({isFounderOffer ? "4 cm² Founder 2×" : "2 cm²"})
                  </button>
                  <a
                    href="#bike"
                    className="inline-flex items-center gap-1 rounded-full border bg-card/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Inspect Bike &amp; Tiers <ArrowDown className="h-3 w-3" />
                  </a>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-volt-bright" />
                  Razorpay 1-Tap • No UTR
                </span>
              </div>
            </motion.div>

            {/* ── Real Progress Bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="glass card-pop mt-4 max-w-xl rounded-2xl p-3.5 sm:mt-5 sm:p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  <AnimatedNumber value={raised} currency />
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    / {formatINR(TARGET)}
                  </span>
                </div>
                <span className="rounded-full bg-volt/10 px-2.5 py-1 text-xs font-bold text-volt dark:bg-volt-bright/10 dark:text-volt-bright">
                  {pct}% LOCKED
                </span>
              </div>
              <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="progress-shimmer relative h-full overflow-hidden rounded-full bg-gradient-to-r from-racing to-racing-soft"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(backers > 0 ? 2 : 0, pct)}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">{backers.toLocaleString("en-IN")}</strong> verified slots locked
                </span>
                <span>
                  {foundersLeft > 0
                    ? `${foundersLeft} of ${FOUNDER_LIMIT} Founder 2× spots open`
                    : "Founder Batch #01 full"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] pt-2.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-[#E2E8F0]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" /> Webhook-verified ledger
                </span>
                <span>4K vinyl wrap install</span>
                <span>Pro-rata refund vote</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
