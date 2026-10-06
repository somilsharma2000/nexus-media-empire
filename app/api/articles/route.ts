import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCanonicalSiteUrl } from '@/lib/site-url';
import { saveArticle } from '@/lib/data-layer';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the API route

const dataFilePath = path.join(process.cwd(), 'data', 'articles.json');

async function ensureDataFile() {
  try { 
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true }); 
  } catch {}
  
  try { 
    await fs.access(dataFilePath); 
  } catch {
    // Default initial articles so the page isn't empty on first load
    const initialData = [
      {
        id: 1,
        title: "Apple Prepares Secret Robotics Division for 2027 Launch",
        category: "Tech",
        time: "2 hours ago",
        excerpt: "Following the cancellation of the Apple Car, engineers have pivoted to home robotics...",
        content: "Full article content here...",
        image: "bg-gradient-to-br from-gray-800 to-black",
        featured: false
      },
      {
        id: 2,
        title: "Bitcoin ETFs Break All-Time Volume Records in Single Day",
        category: "Crypto",
        time: "5 hours ago",
        excerpt: "Institutional adoption skyrockets as major funds shift assets into digital stores of value...",
        content: "Full article content here...",
        image: "bg-gradient-to-br from-purple-900 to-black",
        featured: false
      },
      {
        id: 3,
        title: "The Silent Rise of AI Automation in B2B SaaS Workflows",
        category: "AI",
        time: "12 hours ago",
        excerpt: "How small teams are leveraging multi-agent systems to outcompete traditional agencies...",
        content: "Full article content here...",
        image: "bg-gradient-to-br from-green-900 to-black",
        featured: false
      },
      {
        id: 4,
        title: "Federal Reserve Hints at Unexpected Rate Cuts Next Quarter",
        category: "Finance",
        time: "1 day ago",
        excerpt: "Markets rally as inflation cools faster than anticipated, signaling a potential shift in monetary policy...",
        content: "Full article content here...",
        image: "bg-gradient-to-br from-blue-900 to-black",
        featured: false
      }
    ];
    await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2));
  }
}

import { getArticles, saveArticle } from '@/lib/data-layer';

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const body = await req.json();
  const articles = await getArticles();
  
  // Extract a title from the markdown blog or use the topic
  const titleMatch = body.content?.match(/^#\s+(.*)/m);
  const title = body.title || (titleMatch ? titleMatch[1] : `Trending: ${body.topic}`);
  
  // Remove markdown headings and get plain text for excerpt
  const cleanText = (body.content || '').replace(/#/g, '').replace(/\*/g, '').trim();
  const excerpt = body.excerpt || (cleanText.substring(0, 160) + '...');

  // Curated fallback photos
  const photoLibrary: Record<string, string[]> = {
    news: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    ],
    crypto: [
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop",
    ],
    finance: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
    ],
  };

  const niche = body.niche || (body.category === 'Crypto' ? 'crypto' : body.category === 'Finance' ? 'finance' : 'news');
  const nichePhotos = photoLibrary[niche] || photoLibrary.news;
  const selectedImage = body.image || nichePhotos[Math.floor(Math.random() * nichePhotos.length)];
  const slug = (body.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newArticle = {
    id: body.id || `art-${Date.now()}`,
    title: title,
    niche: niche,
    site: niche,
    slug: slug,
    category: body.category || (niche === 'crypto' ? 'Crypto' : niche === 'finance' ? 'Finance' : 'AI & Tech'),
    time: 'Just now',
    excerpt: excerpt,
    content: body.content,
    metaDescription: body.metaDescription || '',
    tweets: body.tweets || [],
    tweetThread: body.tweets || body.tweetThread || [],
    image: selectedImage,
    featured: true,
    status: body.status || 'draft',
    publishedAt: body.status === 'published' ? new Date().toISOString() : null,
    publishAt: body.publishAt || new Date().toISOString(),
    viewCount: 0,
    qaStatus: 'pending',
    qaVerdict: null,
  };
  
  await saveArticle(newArticle);

  // ── Auto-run QA review if API key is available ───────────────────────────
  let qaVerdict = null;
  const siteUrl = getCanonicalSiteUrl();
  if (process.env.OPENAI_API_KEY) {
    try {
      const qaRes = await fetch(`${siteUrl}/api/qa-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: String(newArticle.id),
          content: newArticle.content,
        }),
      });
      if (qaRes.ok) {
        const qaData = await qaRes.json();
        qaVerdict = qaData.verdict ?? null;
      }
    } catch (qaErr) {
      console.error('[QA Auto-Review] Failed:', qaErr);
    }
  }

  // Notify SEO system about the new article URL
  try {
    const articleUrl = `${siteUrl}/news/${newArticle.slug || newArticle.id}`;
    await fetch(`${siteUrl}/api/seo/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: articleUrl }),
    });
  } catch (pingErr) {
    console.error('[SEO Ping] Failed to ping:', pingErr);
  }

  return NextResponse.json({ success: true, article: newArticle, qaVerdict });
}
