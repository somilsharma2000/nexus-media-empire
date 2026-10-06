import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCanonicalSiteUrl } from '@/lib/site-url';

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

  // 1. Sanitize to strictly relative path for internal queue persistence
  let relativePath = url;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    try {
      const parsed = new URL(relativePath);
      relativePath = parsed.pathname;
    } catch {
      // Keep as-is if parsing fails
    }
  }
  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  // 2. Build full canonical URL using production baseUrl for external indexing engines
  const baseUrl = getCanonicalSiteUrl();
  const canonicalUrl = `${baseUrl}${relativePath}`;

  const apiKey = process.env.GOOGLE_INDEXING_API_KEY;
  const indexNowKey = process.env.INDEXNOW_KEY || 'nexus-media-index-key';
  let googlePingsuccess = false;
  let indexNowSuccess = false;

  // 3. Google Indexing API
  if (apiKey) {
    try {
      const res = await fetch(
        `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: canonicalUrl, type: 'URL_UPDATED' }),
        }
      );
      if (res.ok) googlePingsuccess = true;
    } catch (err) {
      console.error('[SEO Ping] Google Indexing API failed:', err);
    }
  }

  // 4. IndexNow Protocol (Bing, DuckDuckGo, Yahoo, AI engines)
  try {
    const host = new URL(canonicalUrl).host;
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `https://${host}/${indexNowKey}.txt`,
        urlList: [canonicalUrl]
      })
    });
    if (indexNowRes.ok || indexNowRes.status === 200 || indexNowRes.status === 202) {
      indexNowSuccess = true;
    }
  } catch (err) {
    console.error('[SEO Ping] IndexNow ping failed:', err);
  }

  // 5. Store relative path only into queue
  const queue = await readQueue();
  if (!queue.includes(relativePath)) {
    queue.push(relativePath);
    await writeQueue(queue);
  }

  return NextResponse.json({
    success: true,
    url: canonicalUrl,
    relativePath,
    google: googlePingsuccess ? 'submitted' : 'skipped_or_queued',
    indexNow: indexNowSuccess ? 'broadcasted_to_bing_and_duckduckgo' : 'queued',
    timestamp: new Date().toISOString()
  });
}
