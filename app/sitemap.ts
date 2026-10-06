import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getArticles } from '@/lib/data-layer';

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://media-empire-beta.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/crypto`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/finance`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/disclosures`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Include queued article URLs from /api/seo/ping (sanitized to baseUrl)
  const queuedUrls = await readQueue();
  const dynamicQueuedRoutes: MetadataRoute.Sitemap = queuedUrls
    .map((rawUrl) => {
      let cleanPath = rawUrl;
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        try {
          cleanPath = new URL(cleanPath).pathname;
        } catch {
          return null;
        }
      }
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
      return {
        url: `${baseUrl}${cleanPath}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  // Load all published/scheduled articles via DB-first data layer
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getArticles();
    articleRoutes = articles
      .filter((a: any) => a.status === 'published' || a.status === 'scheduled')
      .map((a: any) => {
        const niche = a.site || a.niche || 'news';
        const slug = a.slug || a.id;
        return {
          url: `${baseUrl}/${niche}/${slug}`,
          lastModified: new Date(a.updatedAt || a.publishedAt || a.publishAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        };
      });
  } catch (err) {
    console.error('Error adding articles to sitemap:', err);
  }

  // De-duplicate URLs
  const allRoutes = [...staticRoutes, ...dynamicQueuedRoutes, ...articleRoutes];
  const uniqueUrls = new Set<string>();
  const deduplicatedRoutes: MetadataRoute.Sitemap = [];

  for (const route of allRoutes) {
    // Extra safety guarantee: never allow localhost in production sitemap
    const finalUrl = route.url.replace(/http:\/\/localhost:\d+/, baseUrl);
    if (!uniqueUrls.has(finalUrl)) {
      uniqueUrls.add(finalUrl);
      deduplicatedRoutes.push({
        ...route,
        url: finalUrl,
      });
    }
  }

  return deduplicatedRoutes;
}
