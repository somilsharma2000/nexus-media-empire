import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'articles.json');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const niche = searchParams.get('niche');

    const raw = await fs.readFile(ARTICLES_PATH, 'utf-8');
    let articles = JSON.parse(raw);

    if (niche && niche !== 'all') {
      articles = articles.filter((a: any) => a.niche === niche);
    }

    if (query) {
      articles = articles.filter((a: any) =>
        a.title.toLowerCase().includes(query) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(query)) ||
        (a.content && a.content.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      query,
      count: articles.length,
      articles: articles.slice(0, 15).map((a: any) => ({
        id: a.id,
        title: a.title,
        niche: a.niche,
        slug: a.slug,
        excerpt: a.excerpt,
        publishedAt: a.publishedAt || a.publishAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
