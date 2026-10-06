import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function verifyAdminAuth(req?: Request): Promise<boolean> {
  // 1. Check Bearer Token (CRON_SECRET / Admin Secret / Vercel platform-signed cron header)
  if (req) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const vercelCron = req.headers.get('x-vercel-cron');

    if (vercelCron) return true;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  }

  // 2. Cryptographically verify NextAuth session
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch (err) {
    console.error('[AuthGuard] Session verification error:', err);
  }

  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
}
