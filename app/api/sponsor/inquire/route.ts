import { NextResponse } from 'next/server';
import { sendTelegramAlert } from '@/lib/telegram';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import {
  getSponsorshipInquiries,
  saveSponsorshipInquiry,
  deleteSponsorshipInquiry,
} from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inquiries = await getSponsorshipInquiries();
    return NextResponse.json(inquiries);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, 5, 60000);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetMs);
  }

  try {
    const body = await req.json();
    const { companyName, contactEmail, budgetMonthly, targetNiche, placementRequested, notes } = body;

    if (!companyName || !contactEmail) {
      return NextResponse.json({ error: 'Company Name and Email are required' }, { status: 400 });
    }

    const newInquiry = {
      id: `inq-${Date.now()}`,
      brandName: companyName,
      contactEmail,
      budget: budgetMonthly || '$2,500+',
      niche: targetNiche || 'all',
      tier: placementRequested || 'Header Takeover + Newsletter',
      message: notes || '',
      status: 'new',
    };

    await saveSponsorshipInquiry(newInquiry);

    // Send instant push notification to phone via Telegram
    await sendTelegramAlert(
      `💰 <b>NEW BRAND SPONSOR INQUIRY!</b>\n` +
      `🏢 Company: <b>${companyName}</b>\n` +
      `📧 Email: ${contactEmail}\n` +
      `💵 Budget: <b>${budgetMonthly || '$2,500+'}</b>\n` +
      `🎯 Niche: ${targetNiche}\n` +
      `📦 Package: ${placementRequested}\n` +
      `Reply to close the deal!`
    );

    return NextResponse.json({ success: true, inquiry: newInquiry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }
    const inquiries = await getSponsorshipInquiries();
    const existing = inquiries.find((i: any) => i.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    const updated = await saveSponsorshipInquiry({ ...existing, status });
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await deleteSponsorshipInquiry(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


