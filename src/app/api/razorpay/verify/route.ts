import { NextResponse } from "next/server";
import {
  confirmContribution,
  isRazorpayConfigured,
  verifyCheckoutSignature,
} from "@/lib/tvs/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay keys not configured." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const contributionId = typeof body.contributionId === "string" ? body.contributionId : "";
  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";

  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Invalid Razorpay payment signature." }, { status: 400 });
  }

  const result = await confirmContribution({
    contributionId: contributionId || undefined,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
  });

  if (!result) {
    return NextResponse.json({ error: "Pending slot not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
