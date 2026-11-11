import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZONES, sanitizePromoUrl, type ClaimMode, type ZoneId } from "@/lib/tvs/constants";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/tvs/razorpay";

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

  const rawMode = sanitize(body.mode).toUpperCase();
  const mode: ClaimMode =
    rawMode === "COUPLE" || rawMode === "PROMO" ? rawMode : "SOLO";

  const name = sanitize(body.name).slice(0, 25);
  const partnerName = mode === "COUPLE" ? sanitize(body.partnerName).slice(0, 25) || null : null;
  const handle = sanitize(body.handle).slice(0, 24) || null;
  const linkUrl = sanitizePromoUrl(sanitize(body.linkUrl), handle);
  const city = sanitize(body.city).slice(0, 24) || null;
  const zone = body.zone as ZoneId;
  const amount = Math.round(Number(body.amount));

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Enter a name (2–25 characters)." }, { status: 400 });
  }
  if (mode === "COUPLE" && (!partnerName || partnerName.length < 2)) {
    return NextResponse.json(
      { error: "Enter your partner or bro's name (2–25 characters)." },
      { status: 400 },
    );
  }
  if (mode === "PROMO" && !linkUrl) {
    return NextResponse.json(
      { error: "Enter your @Instagram handle or website URL to make your tile clickable." },
      { status: 400 },
    );
  }

  const zoneCfg = ZONES.find((z) => z.id === zone);
  if (!zoneCfg) {
    return NextResponse.json({ error: "Pick a valid bike section." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < zoneCfg.price) {
    return NextResponse.json(
      { error: `Minimum for ${zoneCfg.short} is ₹${zoneCfg.price}.` },
      { status: 400 },
    );
  }
  if (amount > 1000000) {
    return NextResponse.json({ error: "Amount exceeds the single-slot cap." }, { status: 400 });
  }

  try {
    const row = await db.contribution.create({
      data: {
        name,
        partnerName,
        handle,
        linkUrl,
        city,
        mode,
        zone,
        amount,
        status: "PENDING",
      },
    });

    if (isRazorpayConfigured()) {
      const order = await createRazorpayOrder(amount, `rr310_${row.id}`, {
        contributionId: row.id,
        zone,
        mode,
        city: city ?? "",
      });

      await db.contribution.update({
        where: { id: row.id },
        data: { razorpayOrderId: order.id },
      });

      return NextResponse.json({
        flow: "razorpay",
        contributionId: row.id,
        orderId: order.id,
        amountPaise: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      });
    }

    // Local sandbox fallback when Razorpay keys aren't configured yet
    const sandboxOrderId = `order_sim_${row.id.slice(-10)}`;
    await db.contribution.update({
      where: { id: row.id },
      data: { razorpayOrderId: sandboxOrderId },
    });

    return NextResponse.json({
      flow: "sandbox",
      contributionId: row.id,
      orderId: sandboxOrderId,
      amountPaise: amount * 100,
      currency: "INR",
    });
  } catch (err) {
    console.error("[/api/razorpay/order] failed:", err);
    return NextResponse.json({ error: "Could not initialize payment order." }, { status: 500 });
  }
}
