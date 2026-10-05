import { NextResponse } from 'next/server';
import {
  isAuthorised,
  readArticles,
  writeArticles,
  readState,
  log,
  recordFailure,
  recordSuccess,
  Article,
} from '@/lib/pipeline-helpers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check pipeline state
  const state = await readState();
  if (state.publisher?.status === 'paused') {
    await log('publisher', 'info', 'Publisher step is paused – skipping run');
    return NextResponse.json({ message: 'publisher is paused', published: 0, articles: [] });
  }

  const now = new Date();
  let published = 0;
  const publishedTitles: string[] = [];
  const errors: string[] = [];

  try {
    const articles = await readArticles();

    // Find all scheduled articles whose publishAt time has arrived
    const toPublish = articles.filter(
      (a) =>
        a.status === 'scheduled' &&
        a.publishAt &&
        new Date(a.publishAt) <= now
    );

    if (toPublish.length === 0) {
      await log('publisher', 'info', 'No articles due for publishing');
      await recordSuccess('publisher');
      return NextResponse.json({ published: 0, articles: [] });
    }

    // Mark them published
    const publishedAt = now.toISOString();
    articles.forEach((a: Article) => {
      if (toPublish.some((tp) => tp.id === a.id)) {
        a.status = 'published';
        a.publishedAt = publishedAt;
        a.featured = false;
      }
    });

    // Make the newest published article featured
    if (articles.length > 0) {
      const firstPublished = articles.find((a) => a.status === 'published');
      if (firstPublished) firstPublished.featured = true;
    }

    await writeArticles(articles);

    // Ping SEO for each published article
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    for (const article of toPublish) {
      const articleNiche = article.niche || article.category?.toLowerCase() || 'news';
      const articleSlug = article.slug || String(article.id);
      const articleUrl = `${siteUrl}/${articleNiche}/${articleSlug}`;
      try {
        await fetch(`${siteUrl}/api/seo/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: articleUrl }),
        });
      } catch (pingErr: any) {
        errors.push(`SEO ping failed for ${article.title}: ${pingErr.message}`);
      }
      published++;
    }

    await log('publisher', 'success', `Published ${published} articles: ${publishedTitles.join(', ')}`);
    await recordSuccess('publisher');
  } catch (err: any) {
    const msg = `Publisher error: ${err.message}`;
    errors.push(msg);
    await log('publisher', 'failure', msg);
    await recordFailure('publisher', msg);
    return NextResponse.json({ error: msg, published, articles: publishedTitles }, { status: 500 });
  }

  return NextResponse.json({ published, articles: publishedTitles, errors });
}

// Allow GET so Vercel cron also works
export async function GET(req: Request) {
  return POST(req);
}
