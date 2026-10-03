import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

export async function POST(req: Request) {
  try {
    const { email, niche } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const raw = await fs.readFile(SUBSCRIBERS_PATH, 'utf-8').catch(() => '[]');
    const subscribers = JSON.parse(raw);

    const exists = subscribers.some((s: any) => s.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      subscribers.unshift({
        email: email.trim().toLowerCase(),
        niche: niche || 'general',
        subscribedAt: new Date().toISOString(),
      });
      await fs.writeFile(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2));
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
