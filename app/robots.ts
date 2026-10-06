import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/news', '/crypto', '/finance', '/advertise', '/about', '/privacy', '/terms', '/disclosures'],
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot', 'Googlebot'],
        allow: ['/', '/news', '/crypto', '/finance', '/sitemap.xml', '/robots.txt'],
        disallow: ['/admin', '/admin/*', '/api/*'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
