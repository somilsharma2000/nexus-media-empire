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
  const dynamicRoutes: MetadataRoute.Sitemap = queuedUrls.map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}

