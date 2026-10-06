import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function verifyAdminAuth(req?: Request): Promise<boolean> {
  // 1. Check Bearer Token (CRON_SECRET / Admin Secret)
  if (req) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const vercelCron = req.headers.get('x-vercel-cron');

    if (vercelCron) return true;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  }

  // 2. Check NextAuth session
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch {
    // Continue to cookie check
  }

  // 3. Check Admin Clearance Cookie
  try {
    const cookieStore = cookies();
    const clearance = cookieStore.get('nexus_admin_clearance')?.value;
    const sessionToken =
      cookieStore.get('authjs.session-token')?.value ||
      cookieStore.get('__Secure-authjs.session-token')?.value ||
      cookieStore.get('next-auth.session-token')?.value;

    if (clearance === 'true' || Boolean(sessionToken)) {
      return true;
    }
  } catch {
    // Continue
  }

  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: Admin clearance required' }, { status: 401 });
}
