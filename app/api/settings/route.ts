import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { getSettings, saveSettings } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

// GET — return current saved settings from Database / Prisma Setting model (merged with env vars)
export async function GET() {
  const settings = await getSettings();

  // Also include runtime process.env values if missing
  const knownKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'MAX_MONTHLY_AI_BUDGET',
    'DATABASE_URL',
    'AUTH_SECRET',
    'ADMIN_EMAIL',
    'CRON_SECRET',
    'ALERT_WEBHOOK_URL',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_ADMIN_USER_ID',
    'NEXT_PUBLIC_ADSENSE_CLIENT',
    'NEXT_PUBLIC_SITE_URL',
    'GOOGLE_INDEXING_API_KEY',
    'INDEXNOW_KEY',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_BEARER_TOKEN',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'MEDIUM_TOKEN',
    'STRIPE_SECRET_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  for (const k of knownKeys) {
    if (!settings[k] && process.env[k]) {
      settings[k] = process.env[k] as string;
    }
  }

  return NextResponse.json(settings);
}

// POST — save settings to Prisma Setting model & update runtime process.env
export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const keysReceived = Object.keys(body).filter((k) => body[k] !== undefined);

    // 1. Read existing settings and merge in Prisma Database
    const currentSettings = await getSettings();
    const merged = { ...currentSettings, ...body };
    await saveSettings(merged);

    // 2. Update runtime process.env for all non-empty values
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === 'string' && v.trim()) {
        process.env[k] = v.trim();
      }
    }

    return NextResponse.json({ success: true, saved: keysReceived.length });
  } catch (error) {
    console.error('[SETTINGS API ERROR]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
