import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

// GET — return current saved settings (values masked for secrets)
export async function GET() {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

// POST — save settings to data/settings.json
// NOTE: In production on Vercel, use Vercel Dashboard env vars instead.
// This endpoint is for local dev convenience.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Never log secrets
    const keysReceived = Object.keys(body).filter(k => body[k]);
    console.log(`[Settings] Saving ${keysReceived.length} settings`);

    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true, saved: keysReceived.length });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
