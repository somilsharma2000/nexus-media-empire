import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { getAutomationConfig, saveAutomationConfig } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAutomationConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read automation config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await verifyAdminAuth(req);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await req.json();
    await saveAutomationConfig(body);
    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save automation config' }, { status: 500 });
  }
}
