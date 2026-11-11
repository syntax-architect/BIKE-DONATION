import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Direct unverified UTR submission is disabled. Use Razorpay Checkout (/api/razorpay/order)." },
    { status: 410 },
  );
}
