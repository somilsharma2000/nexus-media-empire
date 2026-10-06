import { NextResponse } from 'next/server';
import { getSocialLogs } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getSocialLogs(25);
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json([]);
  }
}

