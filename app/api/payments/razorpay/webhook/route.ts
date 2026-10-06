import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { saveWebhookLog } from "@/lib/data-layer";

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature if secret configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
      });

      if (!isValid) {
        console.warn("[RAZORPAY WEBHOOK] Invalid webhook signature rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    await saveWebhookLog(event);

    const eventType = event.event;
    console.log(`[RAZORPAY WEBHOOK RECEIVED] ${eventType}`);

    // Handle specific event lifecycle
    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        console.log(`[PAYMENT CAPTURED] ID: ${payment?.id}, Amount: ${payment?.amount}`);
        break;
      }
      case "order.paid": {
        const order = event.payload?.order?.entity;
        console.log(`[ORDER PAID] ID: ${order?.id}, Status: ${order?.status}`);
        break;
      }
      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        console.warn(`[PAYMENT FAILED] ID: ${payment?.id}, Reason: ${payment?.error_description}`);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("[RAZORPAY WEBHOOK ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
