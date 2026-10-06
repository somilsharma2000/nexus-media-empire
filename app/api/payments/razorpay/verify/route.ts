import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "data", "payment_transactions.json");

interface PaymentTransaction {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  itemType: string;
  itemId?: string;
  itemTitle?: string;
  customerEmail?: string;
  status: "captured" | "failed" | "pending";
  timestamp: string;
  accessKey?: string;
}

function loadTransactions(): PaymentTransaction[] {
  try {
    if (!fs.existsSync(TRANSACTIONS_PATH)) {
      fs.writeFileSync(TRANSACTIONS_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(TRANSACTIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTransaction(txn: PaymentTransaction) {
  try {
    const list = loadTransactions();
    list.unshift(txn);
    fs.writeFileSync(TRANSACTIONS_PATH, JSON.stringify(list.slice(0, 500), null, 2));
  } catch (err) {
    console.error("[TRANSACTION SAVE ERROR]", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemType = "digital_product",
      itemId,
      itemTitle,
      amount,
      currency = "INR",
      customerEmail,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing order_id or payment_id" },
        { status: 400 }
      );
    }

    // Verify cryptographic signature (or allow sandbox mode)
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || "",
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid cryptographic payment signature" },
        { status: 400 }
      );
    }

    // Generate secure instantaneous digital access key
    const accessKey = `NX-${itemType.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Record verified transaction
    const txnRecord: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: Number(amount) || 0,
      currency: currency.toUpperCase(),
      itemType,
      itemId,
      itemTitle,
      customerEmail,
      status: "captured",
      timestamp: new Date().toISOString(),
      accessKey,
    };

    saveTransaction(txnRecord);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transactionId: txnRecord.id,
      paymentId: razorpay_payment_id,
      accessKey,
      deliveryUrl: itemType === "digital_product" 
        ? `/api/products/${itemId || 'latest'}/download?key=${accessKey}`
        : `/advertise/portal?key=${accessKey}`,
    });
  } catch (error: any) {
    console.error("[RAZORPAY VERIFY ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
