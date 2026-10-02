import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RISING_KEYWORDS = [
  { keyword: 'bitcoin price prediction 2026', position: 14, clicks: 23, impressions: 890, trend: 'up' },
  { keyword: 'ai trading tools review',        position: 11, clicks: 31, impressions: 1200, trend: 'up' },
  { keyword: 'best crypto wallets',            position: 18, clicks: 15, impressions: 670,  trend: 'up' },
];

export async function GET() {
  return NextResponse.json({
    source: 'demo_data',
    note: 'Connect Search Console for real data. Set GOOGLE_SEARCH_CONSOLE_CREDENTIALS env var.',
    keywords: RISING_KEYWORDS,
  });
}
