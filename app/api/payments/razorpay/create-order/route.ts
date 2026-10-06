import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      amount, 
      currency = "INR", 
      itemType = "digital_product", // "digital_product" | "sponsor_slot" | "vip_newsletter" | "custom"
      itemId,
      itemTitle,
      customerEmail,
      customerName,
      metadata = {}
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";

    // If keys are not set, return simulated sandbox order for zero-friction testing
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      const simulatedOrderId = `order_sim_${Date.now()}`;
      return NextResponse.json({
        success: true,
        isSandbox: true,
        orderId: simulatedOrderId,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        keyId: keyId,
        note: "Razorpay sandbox simulator mode. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env for live gateway.",
      });
    }

    // Call real Razorpay API
    const order = await createRazorpayOrder({
      amount: Number(amount),
      currency: currency,
      receipt: `rcpt_${itemType.slice(0, 3)}_${Date.now()}`,
      notes: {
        itemType,
        itemId: itemId || "general",
        itemTitle: itemTitle || "Nexus Digital Asset",
        customerEmail: customerEmail || "unspecified",
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      isSandbox: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY ORDER CREATE ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to initiate Razorpay order",
      },
      { status: 500 }
    );
  }
}
