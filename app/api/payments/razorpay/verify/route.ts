import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "data", "payment_transactions.json");
const CRM_PATH = path.join(process.cwd(), "data", "crm_customers.json");

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

function upsertCrmCustomer(email?: string, name?: string, amount?: number, currency?: string, itemTitle?: string, itemType?: string) {
  if (!email) return;
  try {
    let customers: any[] = [];
    if (fs.existsSync(CRM_PATH)) {
      customers = JSON.parse(fs.readFileSync(CRM_PATH, "utf-8"));
    }
    const existingIdx = customers.findIndex((c: any) => c.email?.toLowerCase() === email.toLowerCase());
    const amt = Number(amount) || 0;
    const isUsd = (currency || "INR").toUpperCase() === "USD";

    if (existingIdx !== -1) {
      const c = customers[existingIdx];
      if (isUsd) c.totalSpentUsd = (c.totalSpentUsd || 0) + amt;
      else c.totalSpentInr = (c.totalSpentInr || 0) + amt;
      c.ordersCount = (c.ordersCount || 0) + 1;
      c.lastActive = new Date().toISOString();
      if (!c.deals) c.deals = [];
      c.deals.unshift({
        id: `deal_${Date.now()}`,
        title: itemTitle || "Online Checkout",
        amount: amt,
        currency: currency?.toUpperCase() || "INR",
        date: new Date().toISOString().split("T")[0],
        status: "Paid"
      });
      if (!c.tags) c.tags = [];
      if (!c.tags.includes("Verified Buyer")) c.tags.push("Verified Buyer");
      if (itemType === "sponsor_slot" && !c.tags.includes("Sponsor")) c.tags.push("Sponsor");
    } else {
      customers.unshift({
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
      });
    }
    fs.writeFileSync(CRM_PATH, JSON.stringify(customers, null, 2));
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

    saveTransaction(txnRecord);
    upsertCrmCustomer(customerEmail, customerName, amount, currency, itemTitle, itemType);

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
