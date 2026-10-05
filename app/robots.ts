import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/auth', '/api/settings'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot'],
        allow: ['/', '/news', '/crypto', '/finance', '/api/rss', '/sitemap.xml'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
