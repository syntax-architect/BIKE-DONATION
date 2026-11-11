"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Grid2x2,
  Heart,
  Palette,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  WRAP_LIVERY_OPTIONS,
  ZONE_MAP,
  formatINR,
  type ZoneId,
} from "@/lib/tvs/constants";
import { formatStickerTitle } from "@/lib/tvs/shareCard";
import { recentFeed, useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { toast } from "sonner";
import { Reveal, SectionHead } from "./Reveal";

interface WallTile {
  id: string;
  name: string;
  partnerName?: string | null;
  handle: string | null;
  linkUrl?: string | null;
  city?: string | null;
  mode?: string;
  zone: ZoneId;
  amount: number;
  isFounder?: boolean;
  claimed: boolean;
  sample?: boolean;
}

const SAMPLE_PREVIEW_TILES: WallTile[] = [
  {
    id: "sample-1",
    name: "Rohan",
    partnerName: "Priya",
    handle: "@rohan_rides",
    linkUrl: "https://instagram.com/rohan_rides",
    city: "Mumbai",
    mode: "COUPLE",
    zone: "BELLY",
    amount: 20,
    isFounder: true,
    claimed: true,
    sample: true,
  },
  {
    id: "sample-2",
    name: "Apex Moto Club",
    handle: "@apexmoto.in",
    linkUrl: "https://instagram.com",
    city: "Bengaluru",
    mode: "PROMO",
    zone: "FAIRING",
    amount: 50,
    isFounder: true,
    claimed: true,
    sample: true,
  },
  {
    id: "sample-3",
    name: "Arjun",
    partnerName: "Kabir",
    handle: "@arjunkabir",
    linkUrl: "https://instagram.com",
    city: "Delhi NCR",
    mode: "COUPLE",
    zone: "TANK",
    amount: 100,
    isFounder: true,
    claimed: true,
    sample: true,
  },
  {
    id: "sample-4",
    name: "GearHead Store",
    handle: "@gearhead.store",
    linkUrl: "https://instagram.com",
    city: "Pune",
    mode: "PROMO",
    zone: "COWL",
    amount: 1000,
    isFounder: true,
    claimed: true,
    sample: true,
  },
];

const OPEN_SLOTS: Array<{ label: string; amount: 10 | 20 | 50; zone: ZoneId }> = [
  { label: "Founder #001", amount: 20, zone: "BELLY" },
  { label: "Open ₹10 Lock", amount: 10, zone: "BELLY" },
  { label: "@Page Link", amount: 50, zone: "FAIRING" },
  { label: "Couple / Bro", amount: 20, zone: "BELLY" },
  { label: "Open ₹10 Lock", amount: 10, zone: "BELLY" },
  { label: "Open ₹20 Spot", amount: 20, zone: "BELLY" },
];

export function WrapWall() {
  const stats = useLiveStore((s) => s.stats);
  const openClaim = useClaimStore((s) => s.openClaim);
  const mode = useClaimStore((s) => s.mode);
  const previewName = useClaimStore((s) => s.previewName);
  const partnerName = useClaimStore((s) => s.partnerName);
  const previewHandle = useClaimStore((s) => s.previewHandle);

  const [query, setQuery] = useState("");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedId, setVotedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/votes", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { counts?: Record<string, number> } | null) => {
        if (d?.counts) setVotes(d.counts);
      })
      .catch(() => {});
  }, []);

  const castVote = async (optionId: string) => {
    if (votedId) return;
    setVotedId(optionId);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optionId, weight: 1 }),
      });
      if (res.ok) {
        const d = (await res.json()) as { counts?: Record<string, number> };
        if (d.counts) setVotes(d.counts);
        toast.success("Vote counted! Lock a ₹10/₹20 tile to join the wrap.");
      }
    } catch {
      /* ignore */
    }
  };

  const hasTyped = previewName.trim().length >= 2;
  const fastStep =
    hasTyped &&
    (mode !== "COUPLE" || partnerName.trim().length >= 2) &&
    (mode !== "PROMO" || previewHandle.trim().length >= 2)
      ? "pay"
      : "details";

  const { tiles, showingSamplePreview } = useMemo(() => {
    const live = recentFeed(stats, 24).map(
      (f): WallTile => ({
        id: f.id,
        name: f.name,
        partnerName: f.partnerName,
        handle: f.handle,
        linkUrl: f.linkUrl,
        city: f.city,
        mode: f.mode,
        zone: f.zone,
        amount: f.amount,
        isFounder: f.isFounder,
        claimed: true,
        sample: false,
      }),
    );

    const previewSamples: WallTile[] = live.length < 4 ? SAMPLE_PREVIEW_TILES : [];
    const open = OPEN_SLOTS.map(
      (o, i): WallTile => ({
        id: `open-${i}`,
        name:
          i === 0 && hasTyped
            ? formatStickerTitle(previewName, partnerName, mode)
            : o.label,
        handle: i === 0 && hasTyped ? "Your live preview — tap to lock" : "Unclaimed wrap tile",
        zone: i === 0 && mode === "PROMO" ? "FAIRING" : o.zone,
        amount: i === 0 && mode === "PROMO" ? 50 : o.amount,
        claimed: false,
      }),
    );

    return {
      tiles: [...live, ...open, ...previewSamples],
      showingSamplePreview: previewSamples.length > 0,
    };
  }, [stats, hasTyped, previewName, partnerName, mode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tiles;
    return tiles.filter(
      (t) =>
        !t.claimed ||
        t.name.toLowerCase().includes(q) ||
        (t.partnerName && t.partnerName.toLowerCase().includes(q)) ||
        (t.handle && t.handle.toLowerCase().includes(q)) ||
        (t.city && t.city.toLowerCase().includes(q)),
    );
  }, [tiles, query]);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <section id="wrap-wall" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Clickable Wrap Mosaic"
          title="Every verified handle becomes a clickable link on the wall."
          sub="Creators, meme pages, and students lock ₹20–₹100 tiles for real profile clicks; couples & friends lock their bond and download their Story Certificate."
        />

        <Reveal delay={0.08} className="mt-8">
          <div className="stage card-pop-lg relative overflow-hidden rounded-2xl border border-white/10 p-3.5 sm:rounded-[2rem] sm:p-6 lg:p-8">
            <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />

            <div className="relative flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                <Grid2x2 className="h-4 w-4 text-racing" />
                <span>Live Wrap Directory</span>
                {showingSamplePreview && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-white/65">
                    <span className="sm:hidden">Sample Previews • Live First</span>
                    <span className="hidden sm:inline">Sample Previews Shown — Live Claims Appear First</span>
                  </span>
                )}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find name, @handle, or city…"
                  aria-label="Search wrap directory"
                  className="h-10 w-full rounded-full border border-white/15 bg-black/40 pl-8 pr-3 text-base text-white placeholder:text-white/40 outline-none focus:border-racing sm:h-9 sm:text-xs"
                />
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((tile) => {
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
                          ? "border-racing bg-racing/25 shadow-[0_0_24px_-6px_rgba(220,38,38,0.65)]"
                          : "border-racing/45 bg-racing/10 hover:border-racing hover:bg-racing/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-racing-soft">
                          <Sparkles className="h-2.5 w-2.5" />
                          {isPreview ? "Your lock" : "Open"}
                        </span>
                        <span className="tnum rounded bg-racing px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          ₹{tile.amount}
                        </span>
                      </div>
                      <div className="mt-2 truncate font-display text-xs font-bold text-white sm:text-sm">
                        {tile.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/75 group-hover:text-white">
                        <Zap className="h-3 w-3 text-racing" /> Lock via Razorpay
                      </div>
                    </motion.button>
                  );
                }

                const title = formatStickerTitle(tile.name, tile.partnerName, tile.mode);
                const inner = (
                  <>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        {tile.mode === "COUPLE" ? (
                          <Heart className="h-2.5 w-2.5 fill-racing text-racing" />
                        ) : (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: z?.color ?? "#EF4444" }}
                          />
                        )}
                        {tile.sample ? (
                          <span className="rounded bg-white/10 px-1 py-0.5 text-[8px] font-bold uppercase text-white/55">
                            Sample
                          </span>
                        ) : tile.isFounder ? (
                          <span className="rounded bg-[#F59E0B]/20 px-1 py-0.5 text-[8px] font-bold uppercase text-[#F59E0B]">
                            2× Founder
                          </span>
                        ) : null}
                      </span>
                      <span className="tnum font-mono text-[10px] font-semibold text-white/60">
                        {formatINR(tile.amount)}
                      </span>
                    </div>
                    <div className="mt-2 truncate font-display text-xs font-bold text-white sm:text-sm">
                      {title}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1 font-mono text-[10px] text-white/55">
                      <span className="truncate">{tile.handle || tile.city || z?.short}</span>
                      {tile.linkUrl && (
                        <ExternalLink className="h-3 w-3 shrink-0 text-[#E2E8F0]" />
                      )}
                    </div>
                  </>
                );

                if (tile.linkUrl) {
                  return (
                    <a
                      key={tile.id}
                      href={tile.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Visit ${tile.name} (${tile.linkUrl})`}
                      className={`relative flex flex-col justify-between rounded-xl border p-3 transition-transform hover:-translate-y-0.5 ${
                        tile.sample
                          ? "border-white/12 bg-white/[0.03] opacity-80 hover:border-white/30"
                          : "border-white/20 bg-[#11131A] hover:border-racing/60"
                      }`}
                    >
                      {inner}
                    </a>
                  );
                }

                return (
                  <div
                    key={tile.id}
                    className={`relative flex flex-col justify-between rounded-xl border p-3 ${
                      tile.sample
                        ? "border-white/10 bg-white/[0.025] opacity-75"
                        : "border-white/15 bg-white/[0.06]"
                    }`}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* Community Wrap Livery Vote */}
            <div className="relative mt-6 rounded-2xl border border-white/[0.08] bg-[#090A0F]/65 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Palette className="h-4 w-4 text-racing" />
                  Vote on the RR 310 Wrap Livery
                </div>
                <span className="text-[11px] text-white/55">
                  {totalVotes} community votes cast
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {WRAP_LIVERY_OPTIONS.map((opt) => {
                  const count = votes[opt.id] ?? 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const chosen = votedId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => castVote(opt.id)}
                      className={`relative overflow-hidden rounded-xl border p-3 text-left transition-colors ${
                        chosen
                          ? "border-racing bg-racing/20"
                          : "border-white/10 bg-white/[0.03] hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{opt.label}</span>
                        {chosen ? (
                          <Check className="h-3.5 w-3.5 text-racing" />
                        ) : (
                          <span className="tnum font-mono text-[10px] text-white/60">
                            {pct}%
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/50">{opt.desc}</div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-racing"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
