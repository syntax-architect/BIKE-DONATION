"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Grid2x2, Search, Sparkles, Zap } from "lucide-react";
import { ZONE_MAP, formatINR, type ZoneId } from "@/lib/tvs/constants";
import { SEED_TICKER, SEED_TOP } from "@/lib/tvs/v3";
import { recentFeed, useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { Reveal, SectionHead } from "./Reveal";

interface WallTile {
  id: string;
  name: string;
  handle: string | null;
  zone: ZoneId;
  amount: number;
  claimed: boolean;
}

const OPEN_SLOTS: Array<{ label: string; amount: 10 | 20; zone: ZoneId }> = [
  { label: "Open ₹20 Slot", amount: 20, zone: "BELLY" },
  { label: "Open ₹10 Slot", amount: 10, zone: "BELLY" },
  { label: "Open ₹20 Slot", amount: 20, zone: "BELLY" },
  { label: "Open ₹10 Slot", amount: 10, zone: "BELLY" },
  { label: "Open ₹20 Slot", amount: 20, zone: "BELLY" },
  { label: "Open ₹10 Slot", amount: 10, zone: "BELLY" },
];

export function WrapWall() {
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const openClaim = useClaimStore((s) => s.openClaim);
  const previewName = useClaimStore((s) => s.previewName);
  const [query, setQuery] = useState("");

  const hasTyped = previewName.trim().length >= 2;
  const fastStep = hasTyped ? "pay" : "details";

  const tiles = useMemo(() => {
    const live = recentFeed(stats, sim, 18).map(
      (f): WallTile => ({
        id: f.id,
        name: f.name,
        handle: f.handle,
        zone: f.zone,
        amount: f.amount,
        claimed: true,
      }),
    );

    const seen = new Set(live.map((t) => `${t.name.toLowerCase()}-${t.amount}`));
    const seeds: WallTile[] = [...SEED_TOP, ...SEED_TICKER]
      .filter((s) => !seen.has(`${s.name.toLowerCase()}-${s.amount}`))
      .slice(0, Math.max(0, 18 - live.length))
      .map((s, i) => ({
        id: `seed-${i}`,
        name: s.name,
        handle: s.handle || null,
        zone: s.zone,
        amount: s.amount,
        claimed: true,
      }));

    const combined = [...live, ...seeds];
    const open = OPEN_SLOTS.map(
      (o, i): WallTile => ({
        id: `open-${i}`,
        name: i === 0 && hasTyped ? previewName.trim() : o.label,
        handle: i === 0 && hasTyped ? "Preview — click to lock" : "Unclaimed panel space",
        zone: o.zone,
        amount: o.amount,
        claimed: false,
      }),
    );

    // Interleave a few open unclaimed slots inside the wrap wall (Zeigarnik trigger)
    const mixed: WallTile[] = [];
    let openIdx = 0;
    combined.forEach((tile, idx) => {
      mixed.push(tile);
      if ((idx === 3 || idx === 8 || idx === 13 || idx === 17) && openIdx < open.length) {
        mixed.push(open[openIdx++]);
      }
    });
    while (openIdx < open.length) mixed.push(open[openIdx++]);
    return mixed;
  }, [stats, sim, hasTyped, previewName]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tiles;
    return tiles.filter(
      (t) =>
        !t.claimed ||
        t.name.toLowerCase().includes(q) ||
        (t.handle && t.handle.toLowerCase().includes(q)),
    );
  }, [tiles, query]);

  return (
    <section id="wrap-wall" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Live Vinyl Wrap Mosaic"
          title={
            <>
              See the <span className="text-racing">empty squares</span> waiting for your name.
            </>
          }
          sub="Every contributor gets a real named block on the Apache RR 310 wrap layout. Tap any glowing empty slot below to lock yours for ₹10 or ₹20."
        />

        <Reveal delay={0.08} className="mt-8">
          <div className="stage card-pop-lg relative overflow-hidden rounded-[2rem] border border-white/10 p-4 sm:p-6 lg:p-8">
            <div
              aria-hidden
              className="bg-grid pointer-events-none absolute inset-0 opacity-40"
            />

            {/* top bar */}
            <div className="relative flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                <Grid2x2 className="h-4 w-4 text-racing-soft" />
                RR 310 Wrap Proof • Live Grid Sample
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a name on the wrap…"
                  aria-label="Search names on the wrap wall"
                  className="h-9 w-full rounded-full border border-white/15 bg-black/40 pl-8 pr-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-racing"
                />
              </div>
            </div>

            {/* mosaic */}
            <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((tile, i) => {
                const z = ZONE_MAP[tile.zone];
                if (!tile.claimed) {
                  const isPreview = tile.id === "open-0" && hasTyped;
                  return (
                    <motion.button
                      key={tile.id}
                      type="button"
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openClaim(tile.zone, tile.amount, fastStep)}
                      className={`group relative flex flex-col justify-between rounded-xl border-2 border-dashed p-3 text-left transition-all ${
                        isPreview
                          ? "border-racing bg-racing/20 shadow-[0_0_24px_-6px_rgba(225,29,72,0.7)]"
                          : "border-racing/50 bg-racing/10 hover:border-racing hover:bg-racing/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-racing-soft">
                          <Sparkles className="h-2.5 w-2.5" />
                          {isPreview ? "Your spot" : "Open"}
                        </span>
                        <span className="tnum rounded bg-racing px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          ₹{tile.amount}
                        </span>
                      </div>
                      <div className="mt-2 truncate font-display text-xs font-bold text-white sm:text-sm">
                        {tile.name.toUpperCase()}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/70 group-hover:text-white">
                        <Zap className="h-3 w-3 text-racing-soft" /> Tap to lock
                      </div>
                    </motion.button>
                  );
                }

                return (
                  <motion.div
                    key={tile.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: Math.min(0.25, i * 0.015) }}
                    className="relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: z?.color ?? "#e11d48" }}
                      />
                      <span className="tnum font-mono text-[10px] font-semibold text-white/55">
                        {formatINR(tile.amount)}
                      </span>
                    </div>
                    <div className="mt-2 truncate font-display text-xs font-bold text-white sm:text-sm">
                      {tile.name}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-white/45">
                      {tile.handle || z?.short || tile.zone}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/65">
              <span>
                Every extra ₹5 adds <strong className="text-white">1 cm²</strong> of print width on the
                actual vinyl sheet.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openClaim("BELLY", 10, fastStep)}
                  className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:border-racing hover:bg-racing"
                >
                  Claim ₹10 Tile
                </button>
                <button
                  type="button"
                  onClick={() => openClaim("BELLY", 20, fastStep)}
                  className="btn-racing rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
                >
                  Claim ₹20 Double Tile
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

