import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wrapAreaCm2 } from "@/lib/tvs/constants";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const pin = req.headers.get("x-admin-pin") || "";
  const expected = process.env.ADMIN_PIN || "3100";
  return Boolean(pin && pin === expected);
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.contribution.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const url = new URL(req.url);
  if (url.searchParams.get("format") === "csv") {
    const confirmed = rows.filter((r) => r.status === "CONFIRMED");
    const header = "Code,Mode,Name,PartnerName,Handle,LinkURL,City,Zone,AmountINR,WrapCm2,Founder,PaymentID,CreatedAt";
    const esc = (v: string | null | undefined) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = confirmed.map((r) =>
      [
        `RR31-${r.id.slice(-6).toUpperCase()}`,
        r.mode,
        esc(r.name),
        esc(r.partnerName),
        esc(r.handle),
        esc(r.linkUrl),
        esc(r.city),
        r.zone,
        r.amount,
        wrapAreaCm2(r.amount, r.isFounder),
        r.isFounder ? "YES" : "NO",
        esc(r.razorpayPaymentId || r.txId),
        r.createdAt.toISOString(),
      ].join(","),
    );
    return new Response([header, ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rr310-wrap-confirmed.csv"',
      },
    });
  }

  return NextResponse.json({ rows });
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { id?: string; status?: string };
  if (!body.id || !["CONFIRMED", "PENDING", "REJECTED"].includes(body.status || "")) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  }
  const updated = await db.contribution.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ row: updated });
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.contribution.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
