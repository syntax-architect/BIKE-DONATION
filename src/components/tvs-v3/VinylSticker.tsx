"use client";

import { motion } from "framer-motion";
import { Heart, Link2, Lock, Sparkles } from "lucide-react";
import { ZONE_MAP, formatINR, wrapAreaCm2, type ClaimMode, type ZoneId } from "@/lib/tvs/constants";
import { formatStickerTitle } from "@/lib/tvs/shareCard";

export function VinylSticker({
  name,
  partnerName,
  handle,
  city,
  mode = "SOLO",
  zone,
  amount,
  isFounder = false,
  isPlaceholder = false,
  watermarked = false,
  className = "",
}: {
  name: string;
  partnerName?: string | null;
  handle?: string | null;
  city?: string | null;
  mode?: ClaimMode | string;
  zone: ZoneId;
  amount: number;
  isFounder?: boolean;
  isPlaceholder?: boolean;
  watermarked?: boolean;
  className?: string;
}) {
  const z = ZONE_MAP[zone];
  const title =
    mode === "COUPLE" && !name.trim() && !partnerName?.trim()
      ? "ROHAN × PRIYA"
      : formatStickerTitle(name, partnerName, mode);
  const cm2 = wrapAreaCm2(amount, isFounder);

  return (
    <motion.div
      key={`${mode}-${zone}`}
      initial={{ scale: 0.97, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`sticker-sheen relative overflow-hidden rounded-xl border bg-[#0c0e15]/95 px-3.5 py-2.5 text-left shadow-[0_14px_34px_-10px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors ${className}`}
      style={{ borderColor: `${z.color}88` }}
    >
      {/* top racing accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${z.color}, #e11d48)` }}
      />

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">
          {mode === "COUPLE" ? (
            <Heart className="h-2.5 w-2.5 fill-racing text-racing" />
          ) : mode === "PROMO" ? (
            <Link2 className="h-2.5 w-2.5 text-volt-bright" />
          ) : (
            <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ background: z.color }} />
          )}
          {z.short} • {cm2} cm²{isFounder ? " (2×)" : ""}
        </span>
        <span className="tnum rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
          {formatINR(amount)}
        </span>
      </div>

      <div
        className={`mt-1 truncate font-display text-base font-bold tracking-wide sm:text-lg ${
          isPlaceholder ? "text-white/55" : "text-white"
        }`}
      >
        {title}
      </div>

      <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px]">
        <span className="truncate font-mono text-racing-soft">
          {handle?.trim()
            ? handle.trim()
            : mode === "COUPLE"
              ? "Official Couple / Bro Lock"
              : mode === "PROMO"
                ? "Clickable Wrap Directory Link"
                : "Permanent Wrap Slot"}
        </span>
        {city?.trim() ? (
          <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/65">
            {city.trim()}
          </span>
        ) : null}
      </div>

      {watermarked && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 rounded-lg border border-dashed border-racing/50 bg-racing/15 px-2.5 py-1 text-[10px] font-bold text-racing-soft">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 shrink-0" />
            <span className="sm:hidden">LOCKED PREVIEW</span>
            <span className="hidden sm:inline">STORY PASS PREVIEW (LOCKED)</span>
          </span>
          <span className="flex items-center gap-1 text-white/80">
            <Sparkles className="h-2.5 w-2.5 shrink-0" /> Unlocks on pay
          </span>
        </div>
      )}
    </motion.div>
  );
}
