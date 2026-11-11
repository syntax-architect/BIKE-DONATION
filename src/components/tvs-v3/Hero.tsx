"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Flame, Heart, Link2, ShieldCheck, Sparkles, User, Zap } from "lucide-react";
import {
  CLAN_CITIES,
  FOUNDER_LIMIT,
  TARGET,
  formatINR,
  type ClaimMode,
} from "@/lib/tvs/constants";
import { HERO_ANGLES } from "@/lib/tvs/v3";
import { AnimatedNumber } from "./AnimatedNumber";
import { VinylSticker } from "./VinylSticker";
import { totalRaised, totalBackers, useLiveStore, useClaimStore } from "@/lib/tvs/store";

const MODES: Array<{ id: ClaimMode; label: string; icon: typeof Heart }> = [
  { id: "SOLO", label: "Solo Rider", icon: User },
  { id: "COUPLE", label: "Bro / Couple Lock", icon: Heart },
  { id: "PROMO", label: "Promote @Page", icon: Link2 },
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const by = params.get("by")?.trim().slice(0, 25);
    if (by) setReferrer(by);
  }, [setReferrer]);

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
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        {referrer && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-racing/35 bg-[#11131A] px-4 py-1.5 text-xs font-semibold text-[#F8FAFC]">
            <Sparkles className="h-3.5 w-3.5 text-racing" />
            <span>
              <strong>{referrer}</strong> locked a tile on this RR 310 — claim yours next to theirs from ₹10!
            </span>
          </div>
        )}

        <div className="grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10">
          {/* ── Editorial copy + 3-mode interactive lock box ── */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#11131A] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#F59E0B]"
            >
              <Flame className="h-3.5 w-3.5" />
              FOUNDER BATCH #01 • First 500 Get 2× Vinyl Area + Clickable Social Link ({foundersLeft} open)
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-4 font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-[3.5rem]"
            >
              Lock your name, couple tag, or @page on a{" "}
              <span className="text-racing">38 HP</span> RR 310 for{" "}
              <span className="text-racing">₹10</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              Send your partner or best friend an official{" "}
              <strong className="font-semibold text-[#F8FAFC]">Couple / Bro Lock Certificate</strong>,
              buy a <strong className="font-semibold text-[#F8FAFC]">clickable @Instagram tile</strong>{" "}
              on the Wrap Wall, and get printed permanently on the TVS Apache RR 310 vinyl wrap.
            </motion.p>

            {/* ── 3-Mode Sticker Configurator ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="card-pop mt-5 max-w-xl rounded-2xl border border-white/[0.08] bg-[#11131A] p-4"
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
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold transition-all sm:text-xs ${
                        active
                          ? "bg-racing text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{m.label}</span>
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
                  className="h-10.5 min-w-0 rounded-xl border bg-background/80 px-3 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20"
                />

                {mode === "COUPLE" ? (
                  <input
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value.slice(0, 25))}
                    maxLength={25}
                    placeholder="Partner or Bro's name (e.g. Priya)"
                    aria-label="Partner or best friend name"
                    className="h-10.5 min-w-0 rounded-xl border bg-background/80 px-3 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20"
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
                    className="h-10.5 min-w-0 rounded-xl border bg-background/80 px-3 font-mono text-sm outline-none transition placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-racing focus:ring-2 focus:ring-racing/20"
                  />
                )}
              </div>

              {mode === "COUPLE" && (
                <input
                  value={previewHandle}
                  onChange={(e) => setPreviewHandle(e.target.value.slice(0, 24))}
                  maxLength={24}
                  placeholder="Optional @instagram handle (makes your tile clickable too)"
                  aria-label="Optional social handle"
                  className="mt-2 h-9.5 w-full rounded-xl border bg-background/80 px-3 font-mono text-xs outline-none transition placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-racing"
                />
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="City or Clan"
                  className="h-10 rounded-xl border bg-background/80 px-3 text-xs font-semibold outline-none focus:border-racing"
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
                  className="btn-racing inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white transition-transform active:scale-[0.98] sm:text-sm"
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
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" aria-hidden />
                  Razorpay 1-Tap • No UTR
                </span>
              </div>
            </motion.div>

            {/* ── Real Progress Bar (zero fake inflation) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="card-pop mt-5 max-w-xl rounded-2xl border border-white/[0.08] bg-[#11131A] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-xl font-bold tracking-tight text-[#F8FAFC] sm:text-2xl">
                  <AnimatedNumber value={raised} currency />
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    / {formatINR(TARGET)}
                  </span>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-[#F8FAFC]">
                  {pct}% LOCKED
                </span>
              </div>
              <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  className="progress-shimmer relative h-full overflow-hidden rounded-full bg-racing"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(backers > 0 ? 2 : 0, pct)}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <strong className="text-[#F8FAFC]">{backers.toLocaleString("en-IN")}</strong> verified slots locked
                </span>
                <span>
                  {foundersLeft > 0
                    ? `${foundersLeft} of ${FOUNDER_LIMIT} Founder 2× spots open`
                    : "Founder Batch #01 full"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── Clean, uncluttered Apache RR 310 stage ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="stage glow-red card-pop-lg relative mx-auto aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
              {activeAngle.cutout ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 pb-32 pt-14 sm:px-8 sm:pb-36 sm:pt-16">
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
                      className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.75)] transition-opacity duration-300"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={activeAngle.src}
                    alt={`TVS Apache RR 310 BTO — ${activeAngle.label}`}
                    fill
                    priority
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 540px, 500px"
                    className="object-cover object-center transition-opacity duration-300"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/75 to-transparent"
                  />
                </>
              )}

              {/* clean top header & angle switcher */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#11131A]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F8FAFC] backdrop-blur">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden />
                  TVS Apache RR 310 BTO
                </span>
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

              {/* live vinyl decal preview */}
              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
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
                  className="w-full max-w-[320px]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
