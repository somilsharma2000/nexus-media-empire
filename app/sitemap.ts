import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const queueFilePath = path.join(process.cwd(), 'data', 'sitemap_queue.json');

async function readQueue(): Promise<string[]> {
  try {
    const raw = await fs.readFile(queueFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/crypto`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/finance`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];

  // Include queued article URLs from /api/seo/ping
  const queuedUrls = await readQueue();
  
  // Also load all published articles from data/articles.json
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesRaw = await fs.readFile(articlesPath, 'utf-8');
    const articles = JSON.parse(articlesRaw);
    articleRoutes = articles
      .filter((a: { status?: string }) => a.status === 'published' || a.status === 'scheduled')
      .map((a: { niche?: string; slug?: string; id?: string; updatedAt?: string; publishedAt?: string }) => ({
        url: `${baseUrl}/${a.niche || 'news'}/${a.slug || a.id}`,
        lastModified: new Date(a.updatedAt || a.publishedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
  } catch (err) {
    console.error('Error adding articles to sitemap:', err);
  }

  const dynamicRoutes: MetadataRoute.Sitemap = queuedUrls.map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Deduplicate by URL
  const allRoutes = [...staticRoutes, ...articleRoutes, ...dynamicRoutes];
  const uniqueRoutes = Array.from(new Map(allRoutes.map(item => [item.url, item])).values());

  return uniqueRoutes;
}

