import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'data', 'newsletter_log.json');
const SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

export async function POST(req: Request) {
  try {
    const { subject, body, niche } = await req.json();

    const rawSubs = await fs.readFile(SUBSCRIBERS_PATH, 'utf-8').catch(() => '[]');
    const subscribers = JSON.parse(rawSubs);

    const filtered = niche && niche !== 'all'
      ? subscribers.filter((s: any) => s.niche === niche)
      : subscribers;

    const rawLog = await fs.readFile(LOG_PATH, 'utf-8').catch(() => '[]');
    const logs = JSON.parse(rawLog);

    const logEntry = {
      id: `nl-${Date.now()}`,
      subject,
      recipientCount: filtered.length,
      niche: niche || 'all',
      sentAt: new Date().toISOString(),
      status: 'dispatched',
    };

    logs.unshift(logEntry);
    await fs.writeFile(LOG_PATH, JSON.stringify(logs, null, 2));

    return NextResponse.json({
      success: true,
      recipients: filtered.length,
      message: `Newsletter queued for ${filtered.length} subscribers.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to broadcast newsletter' }, { status: 500 });
  }
}
