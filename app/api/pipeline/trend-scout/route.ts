import { NextResponse } from 'next/server';
import {
  isAuthorised,
  readArticles,
  writeArticles,
  readState,
  writeState,
  log,
  recordFailure,
  recordSuccess,
  wordOverlapSimilarity,
  qaReview,
  Article,
} from '@/lib/pipeline-helpers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─── Niche RSS feeds ───────────────────────────────────────────────────────
const TREND_FEEDS = [
  { niche: 'Tech',    url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US&category=15' },
  { niche: 'Crypto',  url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US&category=1025' },
  { niche: 'Finance', url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US&category=7' },
];

/**
 * Fetch an RSS feed and extract trending topic titles.
 * Uses regex to pull <title> tags, skipping the first (feed-level) title.
 */
async function fetchTrends(feedUrl: string): Promise<string[]> {
  const res = await fetch(feedUrl, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${feedUrl}`);
  const xml = await res.text();
  // Extract all <title> tag contents
  const matches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/gi)];
  // Skip first match (feed-level title)
  return matches.slice(1).map((m) => (m[1] || m[2] || '').trim()).filter(Boolean);
}

// ─── POST handler (cron-triggered) ────────────────────────────────────────
export async function POST(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const errors: string[] = [];
  const qaResults: { topic: string; approved: boolean; reason: string }[] = [];
  let topicsFound = 0;
  let topicsPicked = 0;
  let articlesGenerated = 0;

  // ── 1. Check pipeline state ──────────────────────────────────────────────
  const state = await readState();
  if (state.trend_scout?.status === 'paused') {
    await log('trend_scout', 'info', 'Step is paused – skipping run');
    return NextResponse.json({ message: 'trend_scout is paused', topicsFound: 0, topicsPicked: 0, articlesGenerated: 0, qaResults: [], errors: [] });
  }

  // ── 2. Fetch trends from all niches ─────────────────────────────────────
  let allTopics: { topic: string; niche: string }[] = [];
  for (const feed of TREND_FEEDS) {
    try {
      const titles = await fetchTrends(feed.url);
      allTopics = allTopics.concat(titles.map((t) => ({ topic: t, niche: feed.niche })));
      await log('trend_scout', 'info', `Fetched ${titles.length} trends from ${feed.niche}`);
    } catch (err: any) {
      const msg = `RSS fetch error for ${feed.niche}: ${err.message}`;
      errors.push(msg);
      await log('trend_scout', 'failure', msg);
    }
  }
  topicsFound = allTopics.length;

  // ── 3. Dedup against existing articles ──────────────────────────────────
  const articles = await readArticles();
  const existingTitles = articles.map((a) => a.title);

  const deduped = allTopics.filter(({ topic }) => {
    const maxSim = existingTitles.reduce((max, et) => {
      const sim = wordOverlapSimilarity(topic, et);
      return sim > max ? sim : max;
    }, 0);
    return maxSim <= 0.6; // reject if > 60% similar
  });

  // ── 4. Pick top 2 unique topics ──────────────────────────────────────────
  const picked = deduped.slice(0, 2);
  topicsPicked = picked.length;

  if (picked.length === 0) {
    await log('trend_scout', 'info', 'No unique topics found after dedup');
    await recordSuccess('trend_scout');
    return NextResponse.json({ topicsFound, topicsPicked: 0, articlesGenerated: 0, qaResults: [], errors });
  }

  // ── 5. Generate & QA each article ───────────────────────────────────────
  const approvedArticles: Article[] = [];

  for (const { topic, niche } of picked) {
    // 5a. Generate content
    let generatedContent = '';
    try {
      const genRes = await fetch(`${siteUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche }),
      });
      if (!genRes.ok) throw new Error(`Generate API returned ${genRes.status}`);
      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.error || 'Generation failed');
      generatedContent = genData.data?.blog || '';
      articlesGenerated++;
      await log('trend_scout', 'success', `Generated article for topic: "${topic}"`);
    } catch (err: any) {
      const msg = `Generation failed for "${topic}": ${err.message}`;
      errors.push(msg);
      await log('trend_scout', 'failure', msg);
      await recordFailure('trend_scout', msg);
      continue;
    }

    // 5b. QA Review
    const qa = qaReview(generatedContent);
    qaResults.push({ topic, approved: qa.approved, reason: qa.reason });

    if (!qa.approved) {
      await log('qa_review', 'failure', `QA rejected "${topic}": ${qa.reason}`);
      await recordFailure('qa_review', qa.reason);
      errors.push(`QA rejected "${topic}": ${qa.reason}`);
      continue;
    }
    await log('qa_review', 'success', `QA approved "${topic}"`);
    await recordSuccess('qa_review');

    // 5c. Save as draft article
    const titleMatch = generatedContent.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : `Trending: ${topic}`;
    const cleanText = generatedContent.replace(/#/g, '').replace(/\*/g, '').trim();
    const excerpt = cleanText.substring(0, 160) + '...';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const draft: Article = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title,
      category: niche,
      time: 'Just now',
      excerpt,
      content: generatedContent,
      image: 'bg-gradient-to-br from-blue-900 to-black',
      featured: false,
      status: 'draft',
      slug,
      niche,
    };
    approvedArticles.push(draft);
  }

  // ── 6. Schedule approved articles spread over next 48 hours ─────────────
  if (approvedArticles.length > 0) {
    const now = Date.now();
    const msIn48h = 48 * 60 * 60 * 1000;
    const interval = msIn48h / (approvedArticles.length + 1);

    const updatedArticles = await readArticles();

    approvedArticles.forEach((article, idx) => {
      article.status = 'scheduled';
      article.publishAt = new Date(now + interval * (idx + 1)).toISOString();
      // Demote existing featured articles
      updatedArticles.forEach((a) => (a.featured = false));
      updatedArticles.unshift(article);
    });

    await writeArticles(updatedArticles);
    await log('trend_scout', 'success', `Scheduled ${approvedArticles.length} articles for publishing`);
    await recordSuccess('trend_scout');
  }

  return NextResponse.json({
    topicsFound,
    topicsPicked,
    articlesGenerated,
    qaResults,
    errors,
  });
}

// Allow GET so Vercel cron (which uses GET for some versions) also works
export async function GET(req: Request) {
  return POST(req);
}
