import { NextResponse } from 'next/server';
import { getNewsletterSubscribers } from '@/lib/data-layer';

export async function GET() {
  try {
    const subscribers = await getNewsletterSubscribers();
    return NextResponse.json({
      count: subscribers.length,
      recent: subscribers.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ count: 0, recent: [] });
  }
}
