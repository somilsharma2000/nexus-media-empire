import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendTelegramAlert } from '@/lib/telegram';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

const INQUIRIES_PATH = path.join(process.cwd(), 'data', 'sponsorship_inquiries.json');

export async function GET() {
  try {
    const raw = await fs.readFile(INQUIRIES_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
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

    let inquiries: any[] = [];
    try {
      const raw = await fs.readFile(INQUIRIES_PATH, 'utf-8');
      inquiries = JSON.parse(raw);
    } catch {}

    const newInquiry = {
      id: `inq-${Date.now()}`,
      companyName,
      contactEmail,
      budgetMonthly: budgetMonthly || '$2,500+',
      targetNiche: targetNiche || 'all',
      placementRequested: placementRequested || 'Header Takeover + Newsletter',
      notes: notes || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);
    await fs.mkdir(path.dirname(INQUIRIES_PATH), { recursive: true });
    await fs.writeFile(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2));

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
    let inquiries: any[] = [];
    try {
      const raw = await fs.readFile(INQUIRIES_PATH, 'utf-8');
      inquiries = JSON.parse(raw);
    } catch {}

    inquiries = inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq));
    await fs.writeFile(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2));
    return NextResponse.json({ success: true, inquiries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    let inquiries: any[] = [];
    try {
      const raw = await fs.readFile(INQUIRIES_PATH, 'utf-8');
      inquiries = JSON.parse(raw);
    } catch {}

    inquiries = inquiries.filter((inq) => inq.id !== id);
    await fs.writeFile(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

