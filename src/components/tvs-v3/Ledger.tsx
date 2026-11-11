"use client";

import { useState } from "react";
import {
  Bike,
  Crown,
  ExternalLink,
  FileText,
  Flame,
  Layers,
  MapPin,
  Medal,
  Scale,
  Swords,
  Trophy,
  Vote,
} from "lucide-react";
import { COST_BREAKDOWN, TARGET, ZONE_MAP, formatINR } from "@/lib/tvs/constants";
import { MILESTONES, timeAgo } from "@/lib/tvs/psych";
import { formatStickerTitle } from "@/lib/tvs/shareCard";
import { recentFeed, totalRaised, useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

const ICONS: Record<string, typeof Bike> = { bike: Bike, file: FileText, layers: Layers };

type Tab = "top" | "recent" | "turf";

export function Ledger() {
  const [tab, setTab] = useState<Tab>("recent");
  const stats = useLiveStore((s) => s.stats);
  const openClaim = useClaimStore((s) => s.openClaim);

  const raised = totalRaised(stats);
  const feed = recentFeed(stats, 12);
  const top = stats?.top ?? [];
  const cities = stats?.cities ?? [];
  const medals = ["text-amber-400", "text-slate-300", "text-orange-400"];

  return (
    <section id="ledger" className="scroll-mt-20 bg-white/[0.015]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Public Ledger & Open Books"
          title="Verified contributors on the left. Every rupee accounted for on the right."
          sub="Zero fake inflation. Only Razorpay-webhook-confirmed entries appear in the ledger and Turf War."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_1fr]">
          {/* ── Left Column: Combined Tabbed Leaderboard & Claim Feed ── */}
          <Reveal>
            <div className="card-pop relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131A] p-5 sm:p-6">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#EF4444]" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl border border-white/[0.06] bg-[#090A0F] p-1">
                  {[
                    { id: "recent" as Tab, label: "Recent Claims", icon: Flame },
                    { id: "top" as Tab, label: "Top Hall", icon: Trophy },
                    { id: "turf" as Tab, label: "City Turf War", icon: Swords },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          tab === t.id
                            ? "bg-[#11131A] text-[#F8FAFC] shadow-sm"
                            : "text-muted-foreground hover:text-[#F8FAFC]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-racing" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden />
                  Webhook Verified
                </span>
              </div>

              <div className="mt-4 flex-1">
                {tab === "recent" && (
                  feed.length > 0 ? (
                    <ul className="space-y-2">
                      {feed.map((f) => {
                        const z = ZONE_MAP[f.zone];
                        const label = formatStickerTitle(f.name, f.partnerName, f.mode);
                        return (
                          <li
                            key={f.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#090A0F]/80 px-3.5 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: z?.color ?? "#EF4444" }}
                                />
                                <span className="truncate text-sm font-semibold text-[#F8FAFC]">{label}</span>
                                {z && (
                                  <span
                                    className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-block"
                                    style={{ background: `${z.color}1f`, color: z.color }}
                                  >
                                    {z.short}
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                                {f.linkUrl ? (
                                  <a
                                    href={f.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-mono text-[#E2E8F0] hover:text-racing hover:underline"
                                  >
                                    {f.handle || "Visit link"} <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                ) : f.handle ? (
                                  <span className="font-mono">{f.handle}</span>
                                ) : null}
                                {f.city ? <span>• {f.city}</span> : null}
                                <span>• {timeAgo(new Date(f.at).toISOString())}</span>
                              </div>
                            </div>
                            <span className="tnum shrink-0 text-sm font-bold text-racing">
                              {formatINR(f.amount)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <EmptyLedgerState onClaim={() => openClaim("BELLY", 20)} />
                  )
                )}

                {tab === "top" && (
                  top.length > 0 ? (
                    <ol className="space-y-2">
                      {top.map((t, i) => {
                        const z = ZONE_MAP[t.zone as keyof typeof ZONE_MAP];
                        const label = formatStickerTitle(t.name, t.partnerName, t.mode);
                        return (
                          <li
                            key={t.id}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#090A0F]/80 px-3.5 py-2.5"
                          >
                            <span
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#11131A] font-display text-xs font-bold ${
                                medals[i] ?? "text-muted-foreground"
                              }`}
                            >
                              {i === 0 ? <Crown className="h-4 w-4" /> : i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-[#F8FAFC]">{label}</div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {t.linkUrl ? (
                                  <a
                                    href={t.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-mono text-[#E2E8F0] hover:text-racing hover:underline"
                                  >
                                    {t.handle || "Link"} <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                ) : t.handle ? (
                                  <span className="font-mono">{t.handle}</span>
                                ) : null}
                                {z && <span>• {z.short}</span>}
                              </div>
                            </div>
                            <span className="tnum shrink-0 text-sm font-bold text-racing">
                              {formatINR(t.amount)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <EmptyLedgerState onClaim={() => openClaim("TANK", 100)} />
                  )
                )}

                {tab === "turf" && (
                  cities.length > 0 ? (
                    <ol className="space-y-2.5">
                      {cities.map((c, idx) => {
                        const maxCm2 = Math.max(1, cities[0]?.totalCm2 ?? 1);
                        const barPct = Math.round((c.totalCm2 / maxCm2) * 100);
                        return (
                          <li key={c.city} className="rounded-xl border border-white/[0.08] bg-[#090A0F]/80 p-3">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-2 text-[#F8FAFC]">
                                <MapPin className={`h-3.5 w-3.5 ${idx === 0 ? "text-racing" : "text-muted-foreground"}`} />
                                {idx + 1}. {c.city}
                              </span>
                              <span className="tnum font-mono text-racing">
                                {c.totalCm2} cm² • {formatINR(c.totalAmount)}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                              <div
                                className="h-full rounded-full bg-racing transition-all duration-700"
                                style={{ width: `${Math.max(6, barPct)}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <EmptyLedgerState
                      title="City Turf War starts with you"
                      sub="Whichever city or college claims the most cm² chooses the wrap accent color."
                      onClaim={() => openClaim("BELLY", 20)}
                    />
                  )
                )}
              </div>
            </div>
          </Reveal>

          {/* ── Right Column: Exact ₹4,00,000 Cost Breakdown + Dare & Refund Guarantee ── */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-4">
              <div className="card-pop relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131A] p-5 sm:p-6">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#EF4444]" />
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[#F8FAFC]">
                  <Scale className="h-5 w-5 text-racing" /> ₹4,00,000 On-Road Cost Stack
                </h3>
                <div className="mt-4 space-y-4">
                  {COST_BREAKDOWN.map((c) => {
                    const Icon = ICONS[c.icon] ?? Bike;
                    const pct = Math.round((c.amount / TARGET) * 100);
                    return (
                      <div key={c.label}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-[#090A0F] text-[#F8FAFC]">
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-bold leading-snug text-[#F8FAFC]">{c.label}</div>
                              <div className="text-xs text-muted-foreground">{c.note}</div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="tnum text-sm font-bold text-[#F8FAFC]">{formatINR(c.amount)}</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {pct}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-racing"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#090A0F] px-4 py-3 text-[#F8FAFC]">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Target</span>
                  <span className="font-display text-lg font-bold text-racing">{formatINR(TARGET)}</span>
                </div>
              </div>

              <div className="card-pop relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131A] p-5">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#F59E0B]" />
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#F8FAFC]">
                  <Vote className="h-4.5 w-4.5 text-[#F59E0B]" /> Rent-A-Dares &amp; Refund Guarantee
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {MILESTONES.slice(0, 3).map((m) => (
                    <div key={m.at} className="flex items-baseline justify-between gap-2 text-muted-foreground">
                      <span className={raised >= m.at ? "font-semibold text-[#F59E0B]" : ""}>
                        {m.label}
                      </span>
                      <span className="tnum shrink-0 font-mono font-semibold text-[#F8FAFC]">
                        {formatINR(m.at)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  If the full goal isn&rsquo;t hit, contributors vote publicly to extend, print a community wrap, or trigger pro-rata refunds from the locked pool.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function EmptyLedgerState({
  title = "Be Founder #001 on the live ledger",
  sub = "First 500 verified spots get 2× vinyl wrap area FREE + clickable link.",
  onClaim,
}: {
  title?: string;
  sub?: string;
  onClaim: () => void;
}) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.14] bg-[#090A0F]/60 p-6 text-center">
      <div className="font-display text-base font-bold">{title}</div>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{sub}</p>
      <button
        type="button"
        onClick={onClaim}
        className="btn-racing mt-4 h-10 rounded-xl px-5 text-xs font-bold text-white"
      >
        Claim Founder #001 (₹20)
      </button>
    </div>
  );
}
