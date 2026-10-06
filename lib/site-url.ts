/**
 * Returns the canonical base URL of the site.
 * Strictly guarantees localhost is NEVER used in production feeds, sitemaps, or schemas.
 */
export function getCanonicalSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && !env.includes('localhost') && !env.includes('127.0.0.1') && env.startsWith('http')) {
    return env.replace(/\/$/, '');
  }
  return 'https://media-empire-beta.vercel.app';
}
