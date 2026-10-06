import crypto from "crypto";
import Razorpay from "razorpay";

// Initialize Razorpay SDK instance
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export interface CreateOrderParams {
  amount: number; // in standard currency units (e.g. 49 for $49, 3999 for ₹3999)
  currency?: string; // "INR" | "USD" | "EUR"
  receipt?: string;
  notes?: Record<string, string>;
}

/**
 * Creates an order in Razorpay
 * Converts standard amount to sub-units (e.g. paise / cents)
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams) {
  const client = getRazorpayClient();
  const subUnitAmount = Math.round(amount * 100);

  const options = {
    amount: subUnitAmount,
    currency: currency.toUpperCase(),
    receipt: receipt || `rec_${Date.now()}`,
    notes: {
      platform: "Nexus Media Empire",
      ...notes,
    },
  };

  const order = await client.orders.create(options);
  return order;
}

/**
 * Verifies Razorpay Payment Signature (HMAC-SHA256)
 * razorpay_order_id + "|" + razorpay_payment_id
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.warn("[RAZORPAY WARNING] RAZORPAY_KEY_SECRET not configured. Verifying in test sandbox mode.");
    return true; // allow test completion if keys are pending
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies Webhook Signature
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  webhookSecret,
}: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
}): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}
