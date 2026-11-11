"use client";

import { ZONE_MAP, formatINR, wrapAreaCm2, type ZoneId } from "@/lib/tvs/constants";

export function VinylSticker({
  name,
  handle,
  zone,
  amount,
  isPlaceholder = false,
  className = "",
}: {
  name: string;
  handle?: string | null;
  zone: ZoneId;
  amount: number;
  isPlaceholder?: boolean;
  className?: string;
}) {
  const z = ZONE_MAP[zone];
  const label = name.trim() || "YOUR NAME";
  const cm2 = wrapAreaCm2(amount);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#0c0e15]/92 px-3.5 py-2.5 text-left shadow-[0_14px_34px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all ${className}`}
      style={{ borderColor: `${z.color}88` }}
    >
      {/* top racing accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${z.color}, #e11d48)` }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/65">
          <span
            className="live-dot h-1.5 w-1.5 rounded-full"
            style={{ background: z.color }}
          />
          {z.short} • {cm2} cm² vinyl
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
        {label.toUpperCase()}
      </div>
      {handle?.trim() ? (
        <div className="truncate font-mono text-[10px] text-racing-soft">{handle.trim()}</div>
      ) : null}
    </div>
  );
}

