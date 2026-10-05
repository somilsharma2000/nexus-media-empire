import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const { companyName, contactEmail, packageSelected, rateUsd, niche } = body;


    const invoiceId = `INV-NX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const invoice = {
      invoiceNumber: invoiceId,
      issueDate,
      dueDate,
      billTo: {
        company: companyName || "Prospective Brand Partner",
        email: contactEmail || "partner@company.com",
      },
      issuer: {
        name: "Nexus Autonomous Media Network LLC",
        department: "Global Brand Partnerships & Advertising Operations",
        taxId: "US-EIN-94-8842109",
        paymentTerms: "Net-14 Corporate Wire / Stripe Corporate Direct",
      },
      lineItems: [
        {
          description: `${packageSelected || "30-Day Niche Dominance & Header Takeover"} (${niche || "All Sites"})`,
          guaranteedImpressions: "250,000 Verified Human Impressions",
          rate: rateUsd || 1499.00,
          amount: rateUsd || 1499.00,
        }
      ],
      subtotal: rateUsd || 1499.00,
      tax: 0.00,
      totalDue: rateUsd || 1499.00,
      status: "Ready for Wire / Card Settlement",
      slas: [
        "100% Guaranteed Share of Voice on specified category placement.",
        "Unmanipulated SHA-256 telemetry tracking and bot-filtered attribution.",
        "Automatic rollover and 20% bonus impression boost if SLA threshold is delayed."
      ]
    };

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
