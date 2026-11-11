import { NextResponse } from "next/server";
import { confirmContribution, isRazorpayConfigured } from "@/lib/tvs/razorpay";

export const dynamic = "force-dynamic";

/** Local-only webhook simulator when Razorpay API keys are not configured yet. */
export async function POST(req: Request) {
  if (isRazorpayConfigured() || process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Sandbox simulation is disabled when live Razorpay or production is active." },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const contributionId = typeof body.contributionId === "string" ? body.contributionId : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const fakePaymentId = `pay_sim_${Date.now().toString(36)}`;

  const result = await confirmContribution({
    contributionId: contributionId || undefined,
    razorpayOrderId: orderId || undefined,
    razorpayPaymentId: fakePaymentId,
  });

  if (!result) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
