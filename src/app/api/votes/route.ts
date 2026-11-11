import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WRAP_LIVERY_OPTIONS } from "@/lib/tvs/constants";

export const dynamic = "force-dynamic";

const VALID_IDS = new Set<string>(WRAP_LIVERY_OPTIONS.map((o) => o.id));

export async function GET() {
  try {
    const groups = await db.wrapVote.groupBy({
      by: ["option"],
      _sum: { weight: true },
    });
    const counts = Object.fromEntries(
      WRAP_LIVERY_OPTIONS.map((o) => [
        o.id,
        groups.find((g) => g.option === o.id)?._sum.weight ?? 0,
      ]),
    );
    return NextResponse.json({ counts }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/votes GET] failed:", err);
    return NextResponse.json({ counts: {} });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { option?: string; weight?: number };
    const option = typeof body.option === "string" ? body.option : "";
    if (!VALID_IDS.has(option)) {
      return NextResponse.json({ error: "Invalid wrap option" }, { status: 400 });
    }
    const weight = Math.min(5, Math.max(1, Math.round(Number(body.weight) || 1)));
    await db.wrapVote.create({ data: { option, weight } });
    return GET();
  } catch {
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
