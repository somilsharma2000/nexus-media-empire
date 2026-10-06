import { NextResponse } from 'next/server';
import { searchArticles } from '@/lib/data-layer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const niche = searchParams.get('niche') || undefined;

    const matched = await searchArticles(query, niche);

    return NextResponse.json({
      query,
      count: matched.length,
      articles: matched.slice(0, 15).map((a: any) => ({
        id: a.id,
        title: a.title,
        niche: a.site || a.niche,
        slug: a.slug,
        excerpt: a.excerpt,
        publishedAt: a.publishedAt || a.publishAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
