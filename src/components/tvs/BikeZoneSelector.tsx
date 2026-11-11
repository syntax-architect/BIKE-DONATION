"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Fuel, Megaphone, MousePointerClick, Users, Wind } from "lucide-react";
import { Reveal, SectionHeader } from "./Reveal";
import {
  ZONES,
  formatINR,
  formatNum,
  type ZoneConfig,
  type ZoneId,
} from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { StatsData } from "@/lib/tvs/types";

/* ── Interactive region outlines inside the 920×545 viewBox ────────────────── */
const ZONE_SHAPES: Record<ZoneId, string> = {
  FAIRING:
    "M640 246 C676 226 714 220 746 226 C792 238 826 262 852 292 C866 308 868 324 858 340 C842 360 812 376 776 382 L700 390 C692 354 680 312 662 282 C654 268 646 254 640 246 Z",
  TANK:
    "M456 300 C464 270 492 252 530 248 C574 242 618 250 650 264 C666 272 672 286 666 298 C638 314 596 322 554 320 C512 318 478 310 456 300 Z",
  WINGLETS: "M738 240 L812 218 L852 224 L838 250 L772 292 Z",
  BELLY:
    "M610 380 L748 372 L764 390 L744 418 L634 420 C616 410 606 396 610 380 Z",
  COWL: "M172 262 L240 238 L324 254 L326 296 L252 312 L192 298 Z",
};

/* draw order = hover priority (later wins overlaps) */
const OVERLAY_ORDER: ZoneId[] = ["FAIRING", "TANK", "WINGLETS", "BELLY", "COWL"];

const ZONE_ICONS: Record<ZoneId, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  WINGLETS: Wind,
  TANK: Fuel,
  FAIRING: Megaphone,
  BELLY: Users,
  COWL: Crown,
};

function Zone({
  cfg,
  shape,
  active,
  onSelect,
  onHover,
}: {
  cfg: ZoneConfig;
  shape: string;
  active: boolean;
  onSelect: (z: ZoneId) => void;
  onHover: (z: ZoneId | null) => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${cfg.label} — ${formatINR(cfg.price)}`}
      className="cursor-pointer outline-none focus-visible:opacity-100"
      onClick={() => onSelect(cfg.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(cfg.id);
        }
      }}
      onMouseEnter={() => onHover(cfg.id)}
      onMouseLeave={() => onHover(null)}
    >
      <path
        d={shape}
        className="transition-all duration-300"
        fill={active ? cfg.color : "rgba(255,255,255,0.025)"}
        fillOpacity={active ? 0.16 : 1}
        stroke={active ? cfg.color : "rgba(255,255,255,0.16)"}
        strokeWidth={active ? 2 : 1.2}
        strokeDasharray={active ? "0" : "5 5"}
        filter={active ? "url(#zoneGlow)" : undefined}
      />
      {/* hotspot marker */}
      <circle
        cx={cfg.marker.x}
        cy={cfg.marker.y}
        r={7}
        fill={cfg.color}
        className="hotspot-pulse"
        opacity={active ? 0.95 : 0.45}
      />
      <circle
        cx={cfg.marker.x}
        cy={cfg.marker.y}
        r={5.5}
        fill={cfg.color}
        stroke="#0a0a0c"
        strokeWidth={2}
      />
      {/* generous invisible hit area */}
      <circle cx={cfg.marker.x} cy={cfg.marker.y} r={30} fill="transparent" />
    </g>
  );
}

export function BikeZoneSelector({ stats }: { stats: StatsData | null }) {
  const [hovered, setHovered] = useState<ZoneId | null>(null);
  const selectedZone = useClaimStore((s) => s.zoneId);
  const openClaim = useClaimStore((s) => s.openClaim);

  const isLit = (id: ZoneId) => hovered === id || (hovered === null && selectedZone === id);

  const pick = (z: ZoneId) => {
    const cfg = ZONES.find((x) => x.id === z)!;
    openClaim(z, cfg.price);
  };

  return (
    <section id="zones" className="relative py-20 md:py-28 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          index="02"
          kicker="Zone Selector"
          title={
            <>
              Pick Your Piece of{" "}
              <span className="text-racing-soft text-glow-red italic">the Machine</span>
            </>
          }
          sub="Every panel of the RR310 is a contribution tier. Hover a hotspot to preview it, click to claim it — spots sync live from the ledger every 15 seconds."
        />

        {/* ── The bike ── */}
        <Reveal>
          <div className="relative mx-auto max-w-5xl">
            <div className="scanline relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent">
              {/* corner ticks */}
              <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.3em] text-zinc-600 z-10">
                RR310 // BTO-SPEC // SIDE PROFILE
              </div>
              <div className="absolute top-3 right-4 font-mono text-[10px] tracking-[0.3em] text-racing-soft/80 z-10">
                UNIT #01
              </div>

              <div className="relative w-full" style={{ aspectRatio: "920/545" }}>
                <svg
                  viewBox="0 0 920 545"
                  className="w-full h-full select-none"
                  role="img"
                  aria-label="Interactive side profile of the TVS Apache RR 310 with five claimable zones"
                >
                  <defs>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d1d26" />
                      <stop offset="100%" stopColor="#111116" />
                    </linearGradient>
                    <filter id="zoneGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="7" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="softBlur" x="-40%" y="-200%" width="180%" height="500%">
                      <feGaussianBlur stdDeviation="7" />
                    </filter>
                    <filter id="ledGlow" x="-80%" y="-80%" width="260%" height="260%">
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ground */}
                  <ellipse cx="532" cy="492" rx="330" ry="11" fill="#000" opacity="0.55" filter="url(#softBlur)" />
                  <line x1="48" y1="490" x2="892" y2="490" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
                  <line x1="48" y1="497" x2="892" y2="497" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 10" />

                  {/* ── wheels ── */}
                  {[
                    { cx: 300, cy: 415 },
                    { cx: 765, cy: 415 },
                  ].map((w, i) => (
                    <g key={i}>
                      <circle cx={w.cx} cy={w.cy} r={75} fill="none" stroke="#1c1c23" strokeWidth={17} />
                      <circle cx={w.cx} cy={w.cy} r={75} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                      <circle cx={w.cx} cy={w.cy} r={46} fill="#0e0e12" stroke="#2c2c36" strokeWidth={5} />
                      <circle cx={w.cx} cy={w.cy} r={33} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth={2} strokeDasharray="3 4" />
                      {[30, 90, 150].map((a) => (
                        <line
                          key={a}
                          x1={w.cx - 46}
                          y1={w.cy}
                          x2={w.cx + 46}
                          y2={w.cy}
                          stroke="#26262f"
                          strokeWidth={3.5}
                          transform={`rotate(${a} ${w.cx} ${w.cy})`}
                        />
                      ))}
                      <circle cx={w.cx} cy={w.cy} r={9} fill="#2c2c36" stroke="#3a3a46" strokeWidth={2} />
                    </g>
                  ))}

                  {/* ── drivetrain & frame details ── */}
                  <path d="M300 415 L478 398" stroke="#22222b" strokeWidth={13} strokeLinecap="round" />
                  <path d="M300 402 L474 390" stroke="#3a3a46" strokeWidth={1.6} strokeDasharray="4 3" className="dash-move" />
                  <path d="M765 415 L704 262" stroke="#23232c" strokeWidth={9} strokeLinecap="round" />
                  <path d="M748 417 L690 260" stroke="#17171d" strokeWidth={5} strokeLinecap="round" />
                  <path d="M690 258 L742 240" stroke="#2a2a34" strokeWidth={6} strokeLinecap="round" />
                  <path d="M706 214 l18 -7 l7 9 l-17 7 z" fill="#1b1b22" stroke="#2c2c36" strokeWidth={1} />

                  {/* engine block */}
                  <path d="M474 322 L594 318 L610 346 L596 382 L502 388 L472 364 Z" fill="#101016" stroke="#26262f" strokeWidth={1.5} />
                  <path d="M486 334 h100 M484 346 h104 M486 358 h100" stroke="#1e1e26" strokeWidth={2.5} />
                  {/* underbelly exhaust */}
                  <path d="M470 366 C506 382 562 394 614 398 L608 412 C552 408 496 396 458 380 Z" fill="#14141a" stroke="#26262f" strokeWidth={1.2} />
                  <path d="M468 396 l20 7 l-5 11 l-18 -7 z" fill="#1b1b22" stroke="#2c2c36" strokeWidth={1} />

                  {/* ── body ── */}
                  {/* tail / aerocowl */}
                  <path d="M178 266 L238 242 L296 248 L320 262 L302 292 L250 306 L200 294 Z" fill="url(#bodyGrad)" stroke="#2e2e39" strokeWidth={1.6} />
                  <path d="M180 262 l17 -7 l-2 17 z" fill="#E11D48" filter="url(#ledGlow)" />
                  {/* seat */}
                  <path d="M320 262 L420 270 C444 273 462 274 476 272 L470 298 C448 302 424 300 402 296 L330 284 Z" fill="#14141a" stroke="#2e2e39" strokeWidth={1.4} />
                  {/* tank */}
                  <path d="M462 302 C468 274 492 258 528 254 C572 248 616 254 648 268 C662 274 668 286 662 298 C636 312 596 318 556 316 C516 314 484 308 462 302 Z" fill="url(#bodyGrad)" stroke="#34343f" strokeWidth={1.6} />
                  <path d="M520 300 C540 306 570 308 596 304" stroke="#101014" strokeWidth={6} fill="none" strokeLinecap="round" />
                  {/* front fairing */}
                  <path d="M642 250 C674 232 710 226 740 232 C784 244 818 266 844 294 C858 310 860 324 850 338 C834 358 804 372 770 378 L704 386 C696 352 684 312 666 282 C658 268 650 258 642 250 Z" fill="url(#bodyGrad)" stroke="#34343f" strokeWidth={1.6} />
                  {/* windscreen */}
                  <path d="M646 252 C668 228 696 216 722 214 C731 213 736 219 733 228 C726 244 712 254 696 258 L650 264 Z" fill="rgba(56,189,248,0.10)" stroke="rgba(56,189,248,0.45)" strokeWidth={1.5} />
                  {/* winglets */}
                  <path d="M744 246 L808 226 L840 230 L828 246 L770 262 Z" fill="#1b1b24" stroke="#3a3a46" strokeWidth={1.4} />
                  <path d="M760 270 L824 254 L848 260 L834 274 L778 288 Z" fill="#1b1b24" stroke="#3a3a46" strokeWidth={1.4} />
                  {/* headlight */}
                  <path d="M828 294 L852 318 L845 333 L821 313 Z" fill="rgba(56,189,248,0.4)" stroke="#38bdf8" strokeWidth={1.5} filter="url(#ledGlow)" />
                  {/* belly pan */}
                  <path d="M616 384 L744 376 L758 392 L738 414 L638 416 C622 406 612 394 616 384 Z" fill="#15151b" stroke="#2e2e39" strokeWidth={1.5} />
                  {/* front fender */}
                  <path d="M708 358 C732 340 768 336 796 350 L788 372 C764 360 738 362 718 378 Z" fill="#14141a" stroke="#2e2e39" strokeWidth={1.3} />

                  {/* ── printed wrap names (the concept, on the machine) ── */}
                  <g fontFamily="var(--font-jet), monospace" textAnchor="middle" pointerEvents="none">
                    <text x={240} y={288} transform="rotate(-5 240 288)" fontFamily="var(--font-space), sans-serif" fontWeight={700} fontSize={30} fontStyle="italic" fill="#E11D48" opacity={0.9}>
                      01
                    </text>
                    <text x={560} y={291} fontSize={9} fill="#fda4af" opacity={0.85} letterSpacing={1}>
                      ARJUN • MEERA
                    </text>
                    <text x={792} y={244} fontSize={7} fill="#bae6fd" opacity={0.85}>
                      @moto310
                    </text>
                    <text x={772} y={332} fontSize={8.5} fill="#a7f3d0" opacity={0.85} letterSpacing={0.5}>
                      PRIYA.DEV.SAM
                    </text>
                    <text x={688} y={408} fontSize={8} fill="#e4e4e7" opacity={0.85} letterSpacing={0.5}>
                      + 4,873 RIDERS
                    </text>
                    <text x={690} y={432} fontSize={10} fill="#d4d4d8" opacity={0.6} letterSpacing={3} fontFamily="var(--font-space), sans-serif" fontWeight={600}>
                      RR 310
                    </text>
                  </g>

                  {/* ── telemetry annotations ── */}
                  <g fontFamily="var(--font-jet), monospace" fontSize={9.5} fill="#52525e" letterSpacing={1.5}>
                    <text x={88} y={228}>UNIT #01 • BTO SPEC</text>
                    <text x={858} y={206} textAnchor="end">38.2 PS @ 9700 RPM</text>
                    <text x={452} y={444}>KERB ▸ 174 KG</text>
                    <text x={352} y={226}>WRAP AREA ▸ 1.42 m²</text>
                  </g>
                  <g stroke="#2a2a33" strokeWidth={1}>
                    <line x1={300} y1={505} x2={765} y2={505} />
                    <line x1={300} y1={499} x2={300} y2={511} />
                    <line x1={765} y1={499} x2={765} y2={511} />
                  </g>
                  <text x={532} y={524} textAnchor="middle" fontFamily="var(--font-jet), monospace" fontSize={9.5} fill="#52525e" letterSpacing={2}>
                    WHEELBASE ▸ 1365 MM
                  </text>

                  {/* ── interactive zones (drawn last, on top) ── */}
                  {OVERLAY_ORDER.map((id) => {
                    const cfg = ZONES.find((z) => z.id === id)!;
                    return (
                      <Zone
                        key={id}
                        cfg={cfg}
                        shape={ZONE_SHAPES[id]}
                        active={isLit(id)}
                        onSelect={pick}
                        onHover={setHovered}
                      />
                    );
                  })}
                </svg>

                {/* floating callout labels (md+) */}
                {ZONES.map((cfg) => {
                  const remaining = stats?.zones?.[cfg.id]?.remaining ?? cfg.capacity;
                  const active = isLit(cfg.id);
                  return (
                    <button
                      key={cfg.id}
                      onMouseEnter={() => setHovered(cfg.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => pick(cfg.id)}
                      style={{
                        left: cfg.labelPos.left,
                        right: cfg.labelPos.right,
                        top: cfg.labelPos.top,
                        borderColor: active ? cfg.color : undefined,
                        boxShadow: active ? `0 0 30px ${cfg.color}44` : undefined,
                      }}
                      className={`hidden md:block absolute glass rounded-xl px-3.5 py-2.5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${
                        cfg.labelPos.left ? "-translate-x-1/2" : ""
                      } ${active ? "scale-[1.04]" : "opacity-85 hover:opacity-100"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                        <span className="font-display text-[13px] font-semibold text-zinc-100">{cfg.short}</span>
                        <span className="font-mono text-[12.5px] font-bold tnum" style={{ color: cfg.color }}>
                          {formatINR(cfg.price)}
                        </span>
                      </span>
                      <span className={`block mt-0.5 font-mono text-[9.5px] tracking-[0.14em] ${remaining <= 20 ? "text-racing-soft" : "text-zinc-500"}`}>
                        {formatNum(remaining)} LEFT
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pb-4 pt-1 font-mono text-[9.5px] tracking-[0.22em] text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-zinc-500" /> HOVER TO PREVIEW
                </span>
                <span>CLICK TO CLAIM</span>
                <span className="hidden sm:inline">LEDGER SYNC 15s</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── zone cards ── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ZONES.map((cfg, i) => {
            const Icon = ZONE_ICONS[cfg.id];
            const stat = stats?.zones?.[cfg.id];
            const sold = stat?.sold ?? 0;
            const remaining = stat?.remaining ?? cfg.capacity;
            const soldPct = Math.min(100, (sold / cfg.capacity) * 100);
            const scarce = remaining <= 20;
            return (
              <Reveal key={cfg.id} delay={i * 0.06}>
                <motion.button
                  onClick={() => pick(cfg.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  onMouseEnter={() => setHovered(cfg.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="group relative h-full w-full rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left overflow-hidden hover:bg-white/[0.05] transition-colors"
                  style={{ boxShadow: hovered === cfg.id ? `0 12px 44px ${cfg.color}22` : undefined }}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] opacity-70"
                    style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="grid place-items-center w-9 h-9 rounded-lg"
                      style={{ background: `${cfg.color}1a`, color: cfg.color }}
                    >
                      <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                    </span>
                    <span
                      className={`font-mono text-[9.5px] tracking-[0.14em] px-2 py-1 rounded-md ${
                        scarce ? "bg-racing/15 text-racing-soft" : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      {formatNum(remaining)} LEFT
                    </span>
                  </div>
                  <div className="mt-4 font-display text-[26px] font-bold text-zinc-50 tnum leading-none">
                    {formatINR(cfg.price)}
                  </div>
                  <div className="mt-1.5 text-[13.5px] font-semibold text-zinc-200 leading-snug">
                    {cfg.label}
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: cfg.color }}>
                    {cfg.tierName}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-zinc-500 line-clamp-3">{cfg.print}</p>
                  <div className="mt-4 h-1 rounded-full bg-white/6 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(2, soldPct)}%`, background: cfg.color }} />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[9.5px] text-zinc-600">
                    <span>{formatNum(sold)} CLAIMED</span>
                    <span>/ {formatNum(cfg.capacity)}</span>
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
