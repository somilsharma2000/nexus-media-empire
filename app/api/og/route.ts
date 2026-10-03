import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Nexus Media Empire';
  const niche = searchParams.get('niche') || 'news';

  const nicheColors: Record<string, { bar: string; label: string }> = {
    news: { bar: '#3b82f6', label: 'THE TREND MATRIX' },
    crypto: { bar: '#f59e0b', label: 'CRYPTO DAILY' },
    finance: { bar: '#10b981', label: 'WALL ST INSIDER' },
  };

  const selected = nicheColors[niche] || nicheColors.news;

  // Truncate title
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#09090b" />
  <rect width="1200" height="12" fill="${selected.bar}" />
  <g fill="none" stroke="#27272a" stroke-width="1">
    <path d="M0 100 H1200 M0 200 H1200 M0 300 H1200 M0 400 H1200 M0 500 H1200" opacity="0.15" />
  </g>
  <rect x="80" y="80" width="220" height="36" rx="18" fill="${selected.bar}" fill-opacity="0.15" />
  <text x="190" y="104" fill="${selected.bar}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">
    ${selected.label}
  </text>
  <text x="80" y="240" fill="#f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" width="1040">
    <tspan x="80" dy="0">${escapeXml(displayTitle)}</tspan>
  </text>
  <text x="80" y="440" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="24">
    Authoritative analysis, empirical data, and strategic playbooks.
  </text>
  <line x1="80" y1="520" x2="1120" y2="520" stroke="#27272a" stroke-width="2" />
  <text x="80" y="565" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600">
    NEXUS AUTONOMOUS MEDIA NETWORK
  </text>
  <text x="1120" y="565" fill="${selected.bar}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" text-anchor="end">
    VERIFIED ANALYSIS 2026
  </text>
</svg>
`.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
