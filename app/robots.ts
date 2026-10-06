import { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/news', '/crypto', '/finance', '/advertise', '/about', '/privacy', '/terms', '/disclosures'],
        disallow: ['/admin', '/admin/*', '/api/*', '/go/*'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot', 'Googlebot'],
        allow: ['/', '/news', '/crypto', '/finance', '/sitemap.xml', '/robots.txt'],
        disallow: ['/admin', '/admin/*', '/api/*', '/go/*'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
