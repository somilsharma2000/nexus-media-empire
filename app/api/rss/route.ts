import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/data-layer';
import { getCanonicalSiteUrl } from '@/lib/site-url';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const niche = searchParams.get('niche') || 'news';

  const nicheTitles: Record<string, string> = {
    news: 'The Trend Matrix',
    crypto: 'Crypto Daily',
    finance: 'Wall St Insider',
  };

  const pubName = nicheTitles[niche] || 'Nexus Media Empire';
  const siteUrl = getCanonicalSiteUrl();

  try {
    const allArticles = await getArticles();
    const articles = allArticles.filter((a: any) => a.niche === niche || niche === 'all');

    const rssItems = articles
      .slice(0, 25)
      .map((a: any) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/${a.niche}/${a.slug || a.id}</link>
      <guid isPermaLink="true">${siteUrl}/${a.niche}/${a.slug || a.id}</guid>
      <description><![CDATA[${a.excerpt || ''}]]></description>
      <pubDate>${new Date(a.publishedAt || a.publishAt || Date.now()).toUTCString()}</pubDate>
      <category>${a.niche}</category>
    </item>`)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${pubName} - Verified Intelligence Feed</title>
    <link>${siteUrl}/${niche}</link>
    <description>Authoritative empirical analysis and frameworks by ${pubName}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss?niche=${niche}" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`.trim();

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err) {
    return new Response('Failed to generate RSS', { status: 500 });
  }
}
