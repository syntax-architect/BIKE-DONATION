"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Move3d, X, Zap } from "lucide-react";
import { ZONE_MAP, formatINR, type ZoneId } from "@/lib/tvs/constants";
import { DYNA_HOTSPOTS, GALLERY, SIDE_HOTSPOTS, type Hotspot } from "@/lib/tvs/v3";
import { useClaimStore, useLiveStore, zoneSold } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";
import { VinylSticker } from "./VinylSticker";

const HOTSPOT_MAP: Record<string, Hotspot[]> = {
  "studio-dyna": DYNA_HOTSPOTS,
  "studio-side": SIDE_HOTSPOTS,
};

const ASPECTS: Record<string, string> = {
  "studio-dyna": "697 / 725",
  "studio-side": "802 / 493",
};

const CUTOUT_IDS = new Set(["studio-dyna", "studio-side"]);

function HotspotPin({ spot, active, onToggle }: { spot: Hotspot; active: boolean; onToggle: () => void }) {
  const zone = ZONE_MAP[spot.zone];
  const open = useClaimStore((s) => s.openClaim);
  const stats = useLiveStore((s) => s.stats);
  const sold = zoneSold(stats, zone.id);
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
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-30 w-[210px] rounded-2xl border border-white/[0.08] bg-[#11131A]/95 p-3.5 shadow-2xl backdrop-blur-xl sm:w-[235px]"
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
              onClick={() => open(zone.id, zone.price)}
              className="btn-racing mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-white active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" /> Claim {zone.short}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BikeShowcase() {
  const [activeId, setActiveId] = useState(GALLERY[0].id);
  const activeZone = useClaimStore((s) => s.activeZone);
  const setActiveZone = useClaimStore((s) => s.setActiveZone);
  const stageRef = useRef<HTMLDivElement>(null);
  const previewName = useClaimStore((s) => s.previewName);
  const partnerName = useClaimStore((s) => s.partnerName);
  const previewHandle = useClaimStore((s) => s.previewHandle);
  const mode = useClaimStore((s) => s.mode);
  const city = useClaimStore((s) => s.city);

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
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-6 sm:px-6 sm:pt-16 lg:px-8">
        <SectionHead
          eyebrow="Interactive RR 310 Configurator"
          title="Tap any panel on the bike — then pick your tier below."
          sub="Seven real angles of the TVS Apache RR 310 BTO. Tapping a pin highlights its matching tier card right below."
        />

        {/* angle tabs */}
        <Reveal delay={0.05} className="mt-6">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {GALLERY.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setActiveId(g.id);
                  setActiveZone(null);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  activeId === g.id
                    ? "border-racing bg-racing text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.65)]"
                    : "border-white/[0.08] bg-[#11131A] text-muted-foreground hover:border-racing/40 hover:text-[#F8FAFC]"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* stage */}
        <Reveal delay={0.1} className="mt-5">
          <div
            ref={stageRef}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="stage card-pop-lg relative mx-auto aspect-[4/5] w-full max-w-4xl overflow-hidden rounded-[2rem] sm:aspect-auto sm:h-[520px] lg:h-[580px]"
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
              <AnimatePresence>
                {GALLERY.map((g) => {
                  const on = g.id === active.id;
                  const isCutout = CUTOUT_IDS.has(g.id);
                  const imgSpots = HOTSPOT_MAP[g.id] ?? [];
                  return (
                    <motion.div
                      key={g.id}
                      className="absolute inset-0"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.03 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{ pointerEvents: on ? "auto" : "none" }}
                    >
                      {isCutout ? (
                        <div className="absolute inset-0 flex items-center justify-center px-6 pb-20 pt-8 sm:px-12 sm:pb-24 sm:pt-10">
                          <div
                            className={`relative w-full ${
                              g.id === "studio-side" ? "max-w-[640px]" : "max-w-[430px]"
                            }`}
                            style={{ aspectRatio: ASPECTS[g.id] }}
                          >
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-x-[8%] -bottom-3 h-7 rounded-full bg-black/75 blur-xl"
                            />
                            <Image
                              src={g.src}
                              alt={`TVS Apache RR 310 — ${g.caption}`}
                              fill
                              loading={g.id === "studio-dyna" ? "eager" : "lazy"}
                              sizes="(max-width: 640px) 90vw, 640px"
                              className="object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.7)]"
                            />
                            {on &&
                              imgSpots.map((spot) => (
                                <HotspotPin
                                  key={spot.zone}
                                  spot={spot}
                                  active={activeZone === spot.zone}
                                  onToggle={() =>
                                    setActiveZone(activeZone === spot.zone ? null : spot.zone)
                                  }
                                />
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0">
                          <Image
                            src={g.src}
                            alt={`TVS Apache RR 310 — ${g.caption}`}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 92vw, 896px"
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

              {previewName.trim().length >= 2 && (
                <div className="pointer-events-none absolute right-4 top-4 z-10 hidden sm:block">
                  <VinylSticker
                    name={previewName}
                    partnerName={partnerName}
                    handle={previewHandle}
                    city={city}
                    mode={mode}
                    zone={activeZone ?? "BELLY"}
                    amount={activeZone ? ZONE_MAP[activeZone].price : 20}
                    className="w-[230px]"
                  />
                </div>
              )}
            </motion.div>

            {/* caption bar */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3">
              <div className="rounded-xl bg-black/55 px-3.5 py-2 backdrop-blur">
                <p className="text-xs font-semibold text-white sm:text-sm">{active.caption}</p>
              </div>
              {spots.length > 0 && (
                <div className="hidden items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur sm:flex">
                  <Move3d className="h-3.5 w-3.5 text-racing" /> Tap a pin to select zone
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* spec strip */}
        <Reveal delay={0.14}>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {[
              ["38 HP", "peak power"],
              ["29 Nm", "torque"],
              ["312.2 cc", "reverse-inclined DOHC"],
              ["6-Speed", "slipper clutch"],
              ["174 kg", "kerb weight"],
              ["BTO Kit", "aero winglets"],
            ].map(([big, small]) => (
              <div key={big} className="rounded-xl border border-white/[0.08] bg-[#11131A] px-4 py-2 text-center sm:px-5">
                <div className={`font-display text-sm font-bold ${big === "38 HP" ? "text-racing" : "text-[#F8FAFC]"}`}>{big}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{small}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
