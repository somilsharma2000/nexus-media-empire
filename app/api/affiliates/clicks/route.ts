import { NextResponse } from 'next/server';
import { getAffiliateClicksToday } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const counts = await getAffiliateClicksToday();
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({});
  }
}
