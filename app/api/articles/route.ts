import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

export async function GET() {
  await ensureDataFile();
  const data = await fs.readFile(dataFilePath, 'utf-8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
  await ensureDataFile();
  const body = await req.json();
  const data = await fs.readFile(dataFilePath, 'utf-8');
  const articles = JSON.parse(data);
  
  // Extract a title from the markdown blog or use the topic
  const titleMatch = body.content.match(/^#\s+(.*)/m);
  const title = titleMatch ? titleMatch[1] : `Trending: ${body.topic}`;
  
  // Remove markdown headings and get plain text for excerpt
  const cleanText = body.content.replace(/#/g, '').replace(/\*/g, '').trim();
  const excerpt = cleanText.substring(0, 160) + '...';

  const newArticle = {
    id: Date.now(),
    title: title,
    category: body.category || 'AI & Tech',
    time: 'Just now',
    excerpt: excerpt,
    content: body.content,
    metaDescription: body.metaDescription || '',
    tweets: body.tweets || [],
    image: "bg-gradient-to-br from-blue-900 to-black",
    featured: true,
    status: 'draft',
    qaStatus: 'pending',
    qaVerdict: null,
  };
  
  // Demote previous featured articles
  articles.forEach((a: { featured: boolean }) => a.featured = false);
  
  // Add new article to the top
  articles.unshift(newArticle); 
  
  await fs.writeFile(dataFilePath, JSON.stringify(articles, null, 2));

  // ── Auto-run QA review if API key is available ───────────────────────────
  let qaVerdict = null;
  if (process.env.OPENAI_API_KEY) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const articleUrl = `${siteUrl}/news/${newArticle.id}`;
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
