import { NextResponse } from "next/server";
import { confirmContribution, verifyWebhookSignature } from "@/lib/tvs/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } };
      order?: { entity?: { id?: string; notes?: Record<string, string> } };
      payment_link?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const event = payload.event || "";
  if (
    event !== "payment.captured" &&
    event !== "order.paid" &&
    event !== "payment_link.paid"
  ) {
    return NextResponse.json({ ignored: true, event });
  }

  const payment = payload.payload?.payment?.entity;
  const order = payload.payload?.order?.entity;
  const link = payload.payload?.payment_link?.entity;

  const razorpayOrderId = payment?.order_id || order?.id || link?.order_id;
  const razorpayPaymentId = payment?.id;
  const contributionId =
    payment?.notes?.contributionId || order?.notes?.contributionId || link?.notes?.contributionId;

  const confirmed = await confirmContribution({
    contributionId,
    razorpayOrderId,
    razorpayPaymentId,
  });

  return NextResponse.json({ ok: true, confirmed: Boolean(confirmed) });
}
