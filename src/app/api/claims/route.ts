import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZONES, wrapAreaCm2, type ZoneId } from "@/lib/tvs/constants";
import type { ClaimResponse } from "@/lib/tvs/types";

export const dynamic = "force-dynamic";

const sanitize = (s: unknown) =>
  typeof s === "string" ? s.replace(/[\u0000-\u001f<>]/g, "").trim() : "";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitize(body.name).slice(0, 25);
  const handle = sanitize(body.handle).slice(0, 15) || null;
  const zone = body.zone as ZoneId;
  const amount = Math.round(Number(body.amount));
  const txId = sanitize(body.txId).toUpperCase();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Name must be 2-25 characters." }, { status: 400 });
  }
  const zoneCfg = ZONES.find((z) => z.id === zone);
  if (!zoneCfg) {
    return NextResponse.json({ error: "Pick a valid bike section." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < zoneCfg.price) {
    return NextResponse.json(
      { error: `Minimum contribution for ${zoneCfg.short} is ₹${zoneCfg.price}.` },
      { status: 400 },
    );
  }
  if (amount > 1000000) {
    return NextResponse.json({ error: "That amount is too large for this experiment." }, { status: 400 });
  }
  if (!/^\d{12}$/.test(txId)) {
    return NextResponse.json(
      { error: "Enter the 12-digit UPI transaction ID (UTR) from your payment app." },
      { status: 400 },
    );
  }

  try {
    const row = await db.contribution.create({
      data: { name, handle, zone, amount, txId, status: "CONFIRMED" },
    });
    const res: ClaimResponse = {
      claim: {
        id: row.id,
        name: row.name,
        handle: row.handle,
        zone: row.zone,
        amount: row.amount,
        createdAt: row.createdAt.toISOString(),
      },
      code: `RR31-${row.id.slice(-6).toUpperCase()}`,
      cm2: wrapAreaCm2(amount),
    };
    return NextResponse.json(res, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "This transaction ID is already on the ledger. One UTR = one slot." },
        { status: 409 },
      );
    }
    console.error("[/api/claims] create failed:", e);
    return NextResponse.json({ error: "Ledger write failed. Try again." }, { status: 500 });
  }
}
