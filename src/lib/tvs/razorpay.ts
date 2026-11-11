import crypto from "crypto";
import { db } from "@/lib/db";
import { FOUNDER_LIMIT, wrapAreaCm2 } from "@/lib/tvs/constants";
import type { ClaimResponse } from "@/lib/tvs/types";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim(),
  );
}

export async function createRazorpayOrder(
  amountInr: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<{ id: string; amount: number; currency: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountInr * 100), // paise
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${text}`);
  }

  return (await res.json()) as { id: string; amount: number; currency: string };
}

function timingSafeHexEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeHexEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeHexEqual(expected, signature);
}

/** Idempotently mark a pending contribution as CONFIRMED and assign Founder 2x status if eligible. */
export async function confirmContribution(params: {
  contributionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}): Promise<ClaimResponse | null> {
  const { contributionId, razorpayOrderId, razorpayPaymentId } = params;
  const existing = await db.contribution.findFirst({
    where: contributionId
      ? { id: contributionId }
      : razorpayOrderId
        ? { razorpayOrderId }
        : undefined,
  });
  if (!existing) return null;

  if (existing.status === "CONFIRMED") {
    return {
      claim: {
        id: existing.id,
        name: existing.name,
        partnerName: existing.partnerName,
        handle: existing.handle,
        linkUrl: existing.linkUrl,
        city: existing.city,
        mode: existing.mode,
        zone: existing.zone,
        amount: existing.amount,
        isFounder: existing.isFounder,
        status: existing.status,
        createdAt: existing.createdAt.toISOString(),
      },
      code: `RR31-${existing.id.slice(-6).toUpperCase()}`,
      cm2: wrapAreaCm2(existing.amount, existing.isFounder),
    };
  }

  const confirmedCount = await db.contribution.count({
    where: { status: "CONFIRMED" },
  });
  const isFounder = confirmedCount < FOUNDER_LIMIT;

  const updated = await db.contribution.update({
    where: { id: existing.id },
    data: {
      status: "CONFIRMED",
      isFounder,
      ...(razorpayPaymentId
        ? { razorpayPaymentId, txId: razorpayPaymentId }
        : {}),
    },
  });

  return {
    claim: {
      id: updated.id,
      name: updated.name,
      partnerName: updated.partnerName,
      handle: updated.handle,
      linkUrl: updated.linkUrl,
      city: updated.city,
      mode: updated.mode,
      zone: updated.zone,
      amount: updated.amount,
      isFounder: updated.isFounder,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    },
    code: `RR31-${updated.id.slice(-6).toUpperCase()}`,
    cm2: wrapAreaCm2(updated.amount, updated.isFounder),
  };
}
