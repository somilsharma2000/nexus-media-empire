import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "data", "payment_transactions.json");

function getTransactions() {
  try {
    if (!fs.existsSync(TRANSACTIONS_PATH)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(TRANSACTIONS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveTransactions(data: any[]) {
  try {
    fs.writeFileSync(TRANSACTIONS_PATH, JSON.stringify(data.slice(0, 500), null, 2));
  } catch (err) {
    console.error("[TRANSACTIONS SAVE ERROR]", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("type");
    const query = searchParams.get("q")?.toLowerCase();

    let txns = getTransactions();

    if (filterType && filterType !== "all") {
      txns = txns.filter((t: any) => t.itemType === filterType);
    }

    if (query) {
      txns = txns.filter((t: any) => 
        (t.customerName?.toLowerCase().includes(query)) ||
        (t.customerEmail?.toLowerCase().includes(query)) ||
        (t.itemTitle?.toLowerCase().includes(query)) ||
        (t.paymentId?.toLowerCase().includes(query)) ||
        (t.accessKey?.toLowerCase().includes(query))
      );
    }

    const totalUSD = txns
      .filter((t: any) => t.currency === "USD" && t.status === "captured")
      .reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);

    const totalINR = txns
      .filter((t: any) => t.currency === "INR" && t.status === "captured")
      .reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);

    return NextResponse.json({
      success: true,
      transactions: txns,
      stats: {
        totalUSD,
        totalINR,
        count: txns.length,
        capturedCount: txns.filter((t: any) => t.status === "captured").length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      itemTitle,
      itemType = "custom_invoice",
      amount,
      currency = "INR",
      customerEmail,
      customerName,
      paymentMethod = "Direct Razorpay Link",
      notes
    } = body;

    if (!itemTitle || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const accessKey = `NX-INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newTxn = {
      id: `txn_${Date.now()}`,
      orderId: `order_man_${Date.now().toString(36)}`,
      paymentId: `pay_man_${Math.random().toString(36).substring(2, 10)}`,
      amount: Number(amount),
      currency: currency.toUpperCase(),
      itemType,
      itemTitle,
      customerEmail: customerEmail || "client@direct.io",
      customerName: customerName || "Direct Client",
      paymentMethod,
      status: "captured",
      timestamp: new Date().toISOString(),
      accessKey,
      notes
    };

    const current = getTransactions();
    current.unshift(newTxn);
    saveTransactions(current);

    return NextResponse.json({ success: true, transaction: newTxn });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    const current = getTransactions();
    const filtered = current.filter((t: any) => t.id !== id);
    saveTransactions(filtered);

    return NextResponse.json({ success: true, remainingCount: filtered.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
