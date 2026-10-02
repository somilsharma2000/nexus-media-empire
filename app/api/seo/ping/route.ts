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
      if (!res.ok) throw new Error(`Google Indexing API error: ${res.status}`);
      return NextResponse.json({ success: true, method: 'indexing_api' });
    } catch (err) {
      console.error('[SEO Ping] Google Indexing API failed, falling back to queue:', err);
    }
  }

  // Fallback: add to sitemap queue
  const queue = await readQueue();
  if (!queue.includes(url)) {
    queue.push(url);
    await writeQueue(queue);
  }

  return NextResponse.json({ success: true, method: 'sitemap_queue' });
}
