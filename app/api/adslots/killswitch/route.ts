import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { killswitchAllAdSlots } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

// PATCH /api/adslots/killswitch — deactivate all slots
export async function PATCH(req: Request) {
  const isAuth = await verifyAdminAuth(req);
  if (!isAuth) return unauthorizedResponse();

  try {
    const updated = await killswitchAllAdSlots();
    return NextResponse.json({ success: true, deactivated: updated.length });
  } catch {
    return NextResponse.json({ error: 'Failed to execute killswitch' }, { status: 500 });
  }
}

// Support POST fallback
export async function POST(req: Request) {
  return PATCH(req);
}
