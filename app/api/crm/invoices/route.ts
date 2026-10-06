import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const INVOICES_PATH = path.join(process.cwd(), "data", "invoices.json");

function getInvoices() {
  try {
    if (!fs.existsSync(INVOICES_PATH)) return [];
    return JSON.parse(fs.readFileSync(INVOICES_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveInvoices(data: any[]) {
  try {
    fs.writeFileSync(INVOICES_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[INVOICES SAVE ERROR]", err);
  }
}

export async function GET() {
  try {
    const invoices = getInvoices();
    const paidUsd = invoices
      .filter((i: any) => i.currency === "USD" && i.status === "Paid")
      .reduce((acc: number, i: any) => acc + (Number(i.total) || 0), 0);
    
    const pendingUsd = invoices
      .filter((i: any) => i.currency === "USD" && i.status === "Pending")
      .reduce((acc: number, i: any) => acc + (Number(i.total) || 0), 0);

    const paidInr = invoices
      .filter((i: any) => i.currency === "INR" && i.status === "Paid")
      .reduce((acc: number, i: any) => acc + (Number(i.total) || 0), 0);

    return NextResponse.json({
      success: true,
      invoices,
      stats: {
        paidUsd,
        pendingUsd,
        paidInr,
        totalInvoices: invoices.length,
        paidCount: invoices.filter((i: any) => i.status === "Paid").length,
        pendingCount: invoices.filter((i: any) => i.status === "Pending").length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, clientCompany, clientEmail, currency = "USD", items, taxRate = 0, notes, dueDate } = body;

    if (!clientName || !clientEmail || !items || !items.length) {
      return NextResponse.json({ success: false, error: "Missing required invoice fields" }, { status: 400 });
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.qty) * Number(item.rate)), 0);
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const total = subtotal + taxAmount;

    const newInvoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      clientCompany: clientCompany || "Client Org",
      clientEmail,
      currency: currency.toUpperCase(),
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      total,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Pending",
      paymentMethod: "Direct Razorpay Link",
      paymentRef: null,
      items,
      notes: notes || "Payment due within 14 business days. Direct Razorpay gateway link attached."
    };

    const current = getInvoices();
    current.unshift(newInvoice);
    saveInvoices(current);

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, paymentRef, paymentMethod } = body;

    if (!id) return NextResponse.json({ success: false, error: "Missing invoice ID" }, { status: 400 });

    const current = getInvoices();
    const idx = current.findIndex((i: any) => i.id === id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });

    current[idx].status = status || current[idx].status;
    if (paymentRef) current[idx].paymentRef = paymentRef;
    if (paymentMethod) current[idx].paymentMethod = paymentMethod;

    saveInvoices(current);
    return NextResponse.json({ success: true, invoice: current[idx] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
