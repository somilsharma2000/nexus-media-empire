import { NextResponse } from 'next/server';
import { getNewsletterSubscribers, logNewsletterSend } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { subject, body, niche } = await req.json();

    const subscribers = await getNewsletterSubscribers();

    const filtered = niche && niche !== 'all'
      ? subscribers.filter((s: any) => s.niche === niche)
      : subscribers;

    await logNewsletterSend({
      subject: subject || 'Newsletter Broadcast',
      recipientCount: filtered.length,
      niche: niche || 'all',
    });

    return NextResponse.json({
      success: true,
      recipients: filtered.length,
      message: `Newsletter queued for ${filtered.length} subscribers.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to broadcast newsletter' }, { status: 500 });
  }
}

