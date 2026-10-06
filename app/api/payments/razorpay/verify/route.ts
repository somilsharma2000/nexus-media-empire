import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { savePaymentTransaction, getCrmCustomers, saveCrmCustomer } from "@/lib/data-layer";

export const dynamic = 'force-dynamic';

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
  customerName?: string;
  status: "captured" | "failed" | "pending";
  timestamp: string;
  accessKey?: string;
}

async function upsertCrmCustomer(email?: string, name?: string, amount?: number, currency?: string, itemTitle?: string, itemType?: string) {
  if (!email) return;
  try {
    const customers = await getCrmCustomers();
    const existing = customers.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
    const amt = Number(amount) || 0;
    const isUsd = (currency || "INR").toUpperCase() === "USD";

    if (existing) {
      const updated = {
        ...existing,
        totalSpentUsd: isUsd ? (existing.totalSpentUsd || 0) + amt : (existing.totalSpentUsd || 0),
        totalSpentInr: !isUsd ? (existing.totalSpentInr || 0) + amt : (existing.totalSpentInr || 0),
        ordersCount: (existing.ordersCount || 0) + 1,
        lastActive: new Date().toISOString(),
        deals: [
          {
            id: `deal_${Date.now()}`,
            title: itemTitle || "Online Checkout",
            amount: amt,
            currency: currency?.toUpperCase() || "INR",
            date: new Date().toISOString().split("T")[0],
            status: "Paid"
          },
          ...(existing.deals || [])
        ],
        tags: Array.from(new Set([
          ...(existing.tags || []),
          "Verified Buyer",
          itemType === "sponsor_slot" ? "Sponsor" : "Digital Buyer"
        ]))
      };
      await saveCrmCustomer(updated);
    } else {
      const newCustomer = {
        id: `crm_cust_${Date.now()}`,
        name: name || email.split("@")[0],
        email: email,
        company: "Online Customer",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        tier: amt > 200 || (amt > 15000 && !isUsd) ? "VIP Whale" : "Pro Subscriber",
        status: "Active",
        totalSpentUsd: isUsd ? amt : 0,
        totalSpentInr: !isUsd ? amt : 0,
        ordersCount: 1,
        lastActive: new Date().toISOString(),
        tags: ["Verified Buyer", itemType === "sponsor_slot" ? "Sponsor" : "Digital Buyer"],
        assignedRep: "Nexus Commercial Desk",
        notes: `Purchased ${itemTitle || 'Digital Item'} via Razorpay.`,
        deals: [{
          id: `deal_${Date.now()}`,
          title: itemTitle || "Online Checkout",
          amount: amt,
          currency: currency?.toUpperCase() || "INR",
          date: new Date().toISOString().split("T")[0],
          status: "Paid"
        }]
      };
      await saveCrmCustomer(newCustomer);
    }
  } catch (err) {
    console.error("[CRM AUTO-UPSERT ERROR]", err);
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
      customerName,
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
      customerName: customerName || "Online Buyer",
      status: "captured",
      timestamp: new Date().toISOString(),
      accessKey,
    };

    await savePaymentTransaction(txnRecord);
    await upsertCrmCustomer(customerEmail, customerName, amount, currency, itemTitle, itemType);

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

