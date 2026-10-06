import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

const DATA_FILE = path.join(process.cwd(), 'data', 'adslots.json');

// PATCH /api/adslots/killswitch — deactivate all slots
export async function PATCH(req: Request) {
  const isAuth = await verifyAdminAuth(req);
  if (!isAuth) return unauthorizedResponse();

  try {
    const slots = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const updated = slots.map((s: Record<string, unknown>) => ({ ...s, isActive: false }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
    return NextResponse.json({ success: true, deactivated: updated.length });
  } catch {
    return NextResponse.json({ error: 'Failed to execute killswitch' }, { status: 500 });
  }
}

// Support POST fallback
export async function POST(req: Request) {
  return PATCH(req);
}
