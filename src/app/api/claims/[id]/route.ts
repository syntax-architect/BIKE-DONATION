import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wrapAreaCm2 } from "@/lib/tvs/constants";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const row = await db.contribution.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (row.status !== "CONFIRMED") {
    return NextResponse.json({ status: row.status });
  }

  return NextResponse.json({
    status: "CONFIRMED",
    claim: {
      id: row.id,
      name: row.name,
      partnerName: row.partnerName,
      handle: row.handle,
      linkUrl: row.linkUrl,
      city: row.city,
      mode: row.mode,
      zone: row.zone,
      amount: row.amount,
      isFounder: row.isFounder,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    },
    code: `RR31-${row.id.slice(-6).toUpperCase()}`,
    cm2: wrapAreaCm2(row.amount, row.isFounder),
  });
}
