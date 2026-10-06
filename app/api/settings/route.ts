import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');
const ENV_PATH = path.join(process.cwd(), '.env');

import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { getSettings, saveSettings } from '@/lib/data-layer';

// GET — return current saved settings (reads DB/settings.json and falls back to process.env)
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

// POST — save settings to DB / data/settings.json AND sync to .env file & runtime process.env
export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const keysReceived = Object.keys(body).filter((k) => body[k] !== undefined);

    // 1. Read existing settings and merge
    const currentSettings = await getSettings();
    const merged = { ...currentSettings, ...body };
    await saveSettings(merged);

    // 2. Update runtime process.env for all non-empty values
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === 'string' && v.trim()) {
        process.env[k] = v.trim();
      }
    }

    // 3. Update or append in physical .env file
    try {
      let envContent = '';
      try {
        envContent = await fs.readFile(ENV_PATH, 'utf-8');
      } catch {
        envContent = '';
      }

      const envLines = envContent ? envContent.split(/\r?\n/) : [];
      const envMap = new Map<string, string>();
      const otherLines: string[] = [];

      for (const line of envLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          otherLines.push(line);
          continue;
        }
        const eqIdx = line.indexOf('=');
        if (eqIdx !== -1) {
          const key = line.slice(0, eqIdx).trim();
          const val = line.slice(eqIdx + 1).trim();
          envMap.set(key, val);
        } else {
          otherLines.push(line);
        }
      }

      // Merge new values into envMap
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === 'string' && v.trim()) {
          envMap.set(k, v.trim());
        }
      }

      // Reconstruct .env
      const newLines: string[] = [
        '# NEXUS MEDIA EMPIRE — Production Environment Configuration (Updated via Admin Panel)'
      ];
      envMap.forEach((v, k) => {
        newLines.push(`${k}=${v}`);
      });

      await fs.writeFile(ENV_PATH, newLines.join('\n') + '\n', 'utf-8');
    } catch (envErr) {
      console.warn('Could not write directly to .env file:', envErr);
    }

    return NextResponse.json({ success: true, saved: keysReceived.length });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
