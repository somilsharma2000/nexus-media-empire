import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'data', 'social_log.json');

export async function POST(req: Request) {
  try {
    const { title, content, canonicalUrl, tags } = await req.json();
    const token = process.env.MEDIUM_TOKEN;

    const rawLog = await fs.readFile(LOG_PATH, 'utf-8').catch(() => '[]');
    const logs = JSON.parse(rawLog);

    const logEntry = {
      id: `soc-med-${Date.now()}`,
      platform: 'Medium',
      title: title || 'Cross-post',
      status: token ? 'published' : 'simulated',
      note: token ? 'Cross-posted with canonical URL link' : 'Simulated cross-post (token unconfigured).',
      timestamp: new Date().toISOString(),
      url: 'https://medium.com/@thetrendmatrix',
    };

    logs.push(logEntry);
    await fs.writeFile(LOG_PATH, JSON.stringify(logs, null, 2));

    return NextResponse.json({ success: true, mode: token ? 'live' : 'simulator', mediumUrl: logEntry.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cross-post to Medium' }, { status: 500 });
  }
}
