import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import fs from "fs";
import path from "path";

const WEBHOOK_LOGS_PATH = path.join(process.cwd(), "data", "webhook_logs.json");

function logWebhook(eventData: any) {
  try {
    let logs = [];
    if (fs.existsSync(WEBHOOK_LOGS_PATH)) {
      logs = JSON.parse(fs.readFileSync(WEBHOOK_LOGS_PATH, "utf-8"));
    }
    logs.unshift({
      id: `wh_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      event: eventData?.event || "unknown",
      payload: eventData?.payload || {},
    });
    fs.writeFileSync(WEBHOOK_LOGS_PATH, JSON.stringify(logs.slice(0, 100), null, 2));
  } catch (err) {
    console.error("[WEBHOOK LOG ERROR]", err);
  }
}

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
    logWebhook(event);

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
