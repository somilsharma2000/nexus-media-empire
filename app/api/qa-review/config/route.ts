import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { getQAConfig, saveQAConfig } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getQAConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const current = await getQAConfig();
    const merged = { ...current, ...body };

    await saveQAConfig(merged);

    return NextResponse.json({ success: true, config: merged });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update QA config' }, { status: 500 });
  }
}
