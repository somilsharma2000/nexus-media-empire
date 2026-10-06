import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'articles.json');

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const rateLimit = checkRateLimit(req, 60, 60000);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetMs);
  }

  try {
    const raw = await fs.readFile(ARTICLES_PATH, 'utf-8');
    const articles = JSON.parse(raw);
    const idx = articles.findIndex((a: any) => a.id === params.id || a.slug === params.id);
    
    if (idx !== -1) {
      articles[idx].viewCount = (articles[idx].viewCount || 0) + 1;
      await fs.writeFile(ARTICLES_PATH, JSON.stringify(articles, null, 2));
      return NextResponse.json({ success: true, viewCount: articles[idx].viewCount });
    }
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
  }
}
