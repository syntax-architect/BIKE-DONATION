import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FOUNDER_LIMIT, TARGET, ZONES, wrapAreaCm2 } from "@/lib/tvs/constants";
import { isRazorpayConfigured } from "@/lib/tvs/razorpay";
import type { CityStat, ClaimRecord, StatsData, ZoneStat } from "@/lib/tvs/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const confirmedWhere = { status: "CONFIRMED" } as const;
    const [sum, count, groups, recentRows, topRows, allForCities] = await Promise.all([
      db.contribution.aggregate({ where: confirmedWhere, _sum: { amount: true } }),
      db.contribution.count({ where: confirmedWhere }),
      db.contribution.groupBy({ by: ["zone"], where: confirmedWhere, _count: { _all: true } }),
      db.contribution.findMany({ where: confirmedWhere, orderBy: { createdAt: "desc" }, take: 24 }),
      db.contribution.findMany({
        where: confirmedWhere,
        orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
        take: 10,
      }),
      db.contribution.findMany({
        where: { ...confirmedWhere, city: { not: null } },
        select: { city: true, amount: true, isFounder: true },
      }),
    ]);

    const toRecord = (r: {
      id: string;
      name: string;
      partnerName: string | null;
      handle: string | null;
      linkUrl: string | null;
      city: string | null;
      mode: string;
      zone: string;
      amount: number;
      isFounder: boolean;
      status: string;
      createdAt: Date;
    }): ClaimRecord => ({
      id: r.id,
      name: r.name,
      partnerName: r.partnerName,
      handle: r.handle,
      linkUrl: r.linkUrl,
      city: r.city,
      mode: r.mode,
      zone: r.zone,
      amount: r.amount,
      isFounder: r.isFounder,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    });

    const zones = Object.fromEntries(
      ZONES.map((z): [string, ZoneStat] => {
        const sold = groups.find((g) => g.zone === z.id)?._count._all ?? 0;
        return [z.id, { sold, remaining: Math.max(0, z.capacity - sold) }];
      }),
    ) as StatsData["zones"];

    const cityMap = new Map<string, CityStat>();
    for (const row of allForCities) {
      const cName = row.city?.trim();
      if (!cName) continue;
      const cur = cityMap.get(cName) ?? { city: cName, totalAmount: 0, totalCm2: 0, count: 0 };
      cur.totalAmount += row.amount;
      cur.totalCm2 += wrapAreaCm2(row.amount, row.isFounder);
      cur.count += 1;
      cityMap.set(cName, cur);
    }
    const cities = [...cityMap.values()]
      .sort((a, b) => b.totalCm2 - a.totalCm2 || b.totalAmount - a.totalAmount)
      .slice(0, 8);

    const totalRaised = sum._sum.amount ?? 0;
    const data: StatsData = {
      totalRaised,
      target: TARGET,
      contributorCount: count,
      foundersRemaining: Math.max(0, FOUNDER_LIMIT - count),
      progressPct: Math.min(100, Math.round((totalRaised / TARGET) * 1000) / 10),
      zones,
      cities,
      recent: recentRows.map(toRecord),
      top: topRows.map(toRecord),
      razorpayConfigured: isRazorpayConfigured(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/stats] failed:", err);
    return NextResponse.json({ error: "Telemetry offline" }, { status: 500 });
  }
}
