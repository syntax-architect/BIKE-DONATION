"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Move3d, X, Zap } from "lucide-react";
import { ZONE_MAP, formatINR, type ZoneId } from "@/lib/tvs/constants";
import { GALLERY, SIDE_HOTSPOTS, type Hotspot } from "@/lib/tvs/v3";
import { useClaimStore, useLiveStore, zoneSold } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

const HOTSPOT_MAP: Record<string, Hotspot[]> = {
  "studio-side": SIDE_HOTSPOTS,
};

const ASPECTS: Record<string, string> = {
  "studio-side": "850 / 1063",
};

function HotspotPin({ spot, active, onToggle }: { spot: Hotspot; active: boolean; onToggle: () => void }) {
  const zone = ZONE_MAP[spot.zone];
  const open = useClaimStore((s) => s.openClaim);
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const sold = zoneSold(stats, sim, zone.id);
  const left = Math.max(0, zone.capacity - sold);
  const scarce = left <= Math.max(2, zone.capacity * 0.2);

  return (
    <div className="absolute z-20" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${zone.label} — ${formatINR(zone.price)}`}
        className="relative grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95 sm:h-8 sm:w-8"
      >
        <span
          className={`hotspot-pulse absolute inline-flex h-full w-full rounded-full ${active ? "bg-white/70" : ""}`}
          style={{ background: active ? undefined : zone.color, opacity: active ? undefined : 0.55 }}
        />
        <span
          className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/90 shadow-lg sm:h-6 sm:w-6"
          style={{ background: zone.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-30 w-[200px] rounded-2xl border border-white/15 bg-[#0b0d13]/95 p-3.5 shadow-2xl backdrop-blur-xl sm:w-[230px]"
            style={{
              ...(spot.side === "l" ? { right: 20 } : { left: 20 }),
              ...(spot.y > 55 ? { bottom: 8 } : { top: 14 }),
            }}
            role="dialog"
            aria-label={`${zone.label} claim info`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: zone.color }} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {zone.short}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggle}
                aria-label="Close"
                className="text-white/40 transition-colors hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-white">
              {formatINR(zone.price)}
              <span className="ml-1 text-[10px] font-medium text-white/50">min slot</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-white/70">{zone.desc}</p>
            <div
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                scarce ? "bg-racing/20 text-racing-soft" : "bg-white/10 text-white/80"
              }`}
            >
              {scarce ? `Only ${left} left!` : `${left.toLocaleString("en-IN")} of ${zone.capacity.toLocaleString("en-IN")} open`}
            </div>
            <button
              type="button"
              onClick={() => open(zone.id)}
              className="btn-racing mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-white active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" /> Claim this zone
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BikeShowcase() {
  const [activeId, setActiveId] = useState(GALLERY[0].id);
  const [openSpot, setOpenSpot] = useState<ZoneId | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (!canTilt || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 5);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const active = useMemo(() => GALLERY.find((g) => g.id === activeId) ?? GALLERY[0], [activeId]);
  const spots = HOTSPOT_MAP[active.id] ?? [];

  return (
    <section id="bike" className="relative scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Real Bike • Real Wrap • Real Names"
          title={
            <>
              This is the <span className="text-racing">actual RR 310</span> you&rsquo;re funding.
            </>
          }
          sub="No renders, no game graphics. Nine real angles of the machine that will carry 40,000 names. Tap the glowing pins on the studio shots — each one is a claimable zone."
        />

        {/* angle tabs */}
        <Reveal delay={0.1} className="mt-8">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {GALLERY.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setActiveId(g.id);
                  setOpenSpot(null);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  activeId === g.id
                    ? "border-racing bg-racing text-white shadow-[0_8px_20px_-8px_rgba(225,29,72,0.7)]"
                    : "border-border bg-card text-muted-foreground hover:border-racing/40 hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* stage */}
        <Reveal delay={0.15} className="mt-6">
          <div
            ref={stageRef}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="stage card-pop-lg relative mx-auto aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-[2rem] sm:aspect-auto sm:h-[540px] lg:h-[620px]"
            style={{ perspective: 1400 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                rotateX: srx,
                rotateY: sry,
                transformStyle: "preserve-3d",
              }}
            >
              {/* photo layers */}
              <AnimatePresence>
                {GALLERY.map((g) => {
                  const on = g.id === active.id;
                  return (
                    <motion.div
                      key={g.id}
                      className="absolute inset-0"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.03 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      style={{ pointerEvents: on ? "auto" : "none" }}
                    >
                      {g.blend ? (
                        // studio shots blend into the dark stage
                        <div className="absolute inset-0 grid place-items-center">
                          <div
                            className="relative h-full"
                            style={{ aspectRatio: ASPECTS[g.id] ?? "850 / 1063" }}
                          >
                            <Image
                              src={g.src}
                              alt={`TVS Apache RR 310 — ${g.caption}`}
                              fill
                              loading={g.id === "studio-side" ? "eager" : "lazy"}
                              sizes="(max-width: 640px) 90vw, 520px"
                              className="mix-blend-lighten object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0">
                          <Image
                            src={g.src}
                            alt={`TVS Apache RR 310 — ${g.caption}`}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 92vw, 768px"
                            className="object-cover"
                            style={g.pos ? { objectPosition: g.pos } : undefined}
                          />
                          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* hotspots (studio angles only) */}
              {spots.map((spot) => (
                <HotspotPin
                  key={spot.zone}
                  spot={spot}
                  active={openSpot === spot.zone}
                  onToggle={() => setOpenSpot(openSpot === spot.zone ? null : spot.zone)}
                />
              ))}
            </motion.div>

            {/* caption bar */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3">
              <div className="rounded-xl bg-black/50 px-3.5 py-2.5 backdrop-blur">
                <p className="text-xs font-semibold text-white sm:text-sm">{active.caption}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/55">
                  TVS Apache RR 310 • unedited photography
                </p>
              </div>
              {spots.length > 0 && (
                <div className="hidden items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur sm:flex">
                  <Move3d className="h-3.5 w-3.5 text-racing-soft" /> Tap a pin
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* spec chips */}
        <Reveal delay={0.2}>
          <div className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {[
              ["38 HP", "peak power"],
              ["29 Nm", "torque"],
              ["299.12 cc", "single cylinder"],
              ["6-Speed", "with slipper clutch"],
              ["174 kg", "kerb weight"],
              ["Dual-channel ABS", "BTO racing kit"],
            ].map(([big, small]) => (
              <div
                key={big}
                className="glass rounded-xl px-4 py-2.5 text-center sm:px-5"
              >
                <div className="font-display text-sm font-bold sm:text-base">{big}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {small}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
