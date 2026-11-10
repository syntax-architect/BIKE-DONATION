import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZONES, TARGET } from "@/lib/tvs/constants";
import type { StatsData, ClaimRecord, ZoneStat } from "@/lib/tvs/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sum, count, groups, recentRows, topRows] = await Promise.all([
      db.contribution.aggregate({ _sum: { amount: true } }),
      db.contribution.count(),
      db.contribution.groupBy({ by: ["zone"], _count: { _all: true } }),
      db.contribution.findMany({ orderBy: { createdAt: "desc" }, take: 14 }),
      db.contribution.findMany({ orderBy: [{ amount: "desc" }, { createdAt: "asc" }], take: 10 }),
    ]);

    const toRecord = (r: {
      id: string; name: string; handle: string | null; zone: string; amount: number; createdAt: Date;
    }): ClaimRecord => ({
      id: r.id,
      name: r.name,
      handle: r.handle,
      zone: r.zone,
      amount: r.amount,
      createdAt: r.createdAt.toISOString(),
    });

    const zones = Object.fromEntries(
      ZONES.map((z): [string, ZoneStat] => {
        const sold = groups.find((g) => g.zone === z.id)?._count._all ?? 0;
        return [z.id, { sold, remaining: Math.max(0, z.capacity - sold) }];
      }),
    ) as StatsData["zones"];

    const totalRaised = sum._sum.amount ?? 0;
    const data: StatsData = {
      totalRaised,
      target: TARGET,
      contributorCount: count,
      progressPct: Math.min(100, Math.round((totalRaised / TARGET) * 1000) / 10),
      zones,
      recent: recentRows.map(toRecord),
      top: topRows.map(toRecord),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/stats] failed:", err);
    return NextResponse.json({ error: "Telemetry offline" }, { status: 500 });
  }
}
