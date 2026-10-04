import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const queueFilePath = path.join(process.cwd(), 'data', 'sitemap_queue.json');

async function readQueue(): Promise<string[]> {
  try {
    await fs.mkdir(path.dirname(queueFilePath), { recursive: true });
    const raw = await fs.readFile(queueFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeQueue(queue: string[]): Promise<void> {
  await fs.writeFile(queueFilePath, JSON.stringify(queue, null, 2));
}

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_INDEXING_API_KEY;
  const indexNowKey = process.env.INDEXNOW_KEY || 'nexus-media-index-key';
  let googlePingsuccess = false;
  let indexNowSuccess = false;

  // 1. Google Indexing API
  if (apiKey) {
    try {
      const res = await fetch(
        `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, type: 'URL_UPDATED' }),
        }
      );
      if (res.ok) googlePingsuccess = true;
    } catch (err) {
      console.error('[SEO Ping] Google Indexing API failed:', err);
    }
  }

  // 2. IndexNow Protocol (Bing, DuckDuckGo, Yahoo, AI engines)
  try {
    const host = new URL(url).host;
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `https://${host}/${indexNowKey}.txt`,
        urlList: [url]
      })
    });
    if (indexNowRes.ok || indexNowRes.status === 200 || indexNowRes.status === 202) {
      indexNowSuccess = true;
    }
  } catch (err) {
    console.error('[SEO Ping] IndexNow ping failed:', err);
  }

  // Fallback / Audit queue
  const queue = await readQueue();
  if (!queue.includes(url)) {
    queue.push(url);
    await writeQueue(queue);
  }

  return NextResponse.json({
    success: true,
    url,
    google: googlePingsuccess ? 'submitted' : 'skipped_or_queued',
    indexNow: indexNowSuccess ? 'broadcasted_to_bing_and_duckduckgo' : 'queued',
    timestamp: new Date().toISOString()
  });
}
