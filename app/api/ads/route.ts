import { NextResponse } from 'next/server';
import { getAdSlots } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const slots = await getAdSlots();
    return NextResponse.json(slots);
  } catch {
    return NextResponse.json([]);
  }
}

