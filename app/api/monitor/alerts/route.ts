import { NextResponse } from 'next/server';
import { getAlerts, resolveAlert } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const alerts = await getAlerts();
  const sorted = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
  return NextResponse.json(sorted);
}

export async function PATCH(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await resolveAlert(id);
  return NextResponse.json({ success: true, id });
}
