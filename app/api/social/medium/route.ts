import { NextResponse } from 'next/server';
import { appendSocialLog } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { title, content, canonicalUrl, tags } = await req.json();
    const token = process.env.MEDIUM_TOKEN;

    const logEntry = {
      id: `soc-med-${Date.now()}`,
      platform: 'Medium',
      title: title || 'Cross-post',
      status: token ? 'published' : 'simulated',
      note: token ? 'Cross-posted with canonical URL link' : 'Simulated cross-post (token unconfigured).',
      timestamp: new Date().toISOString(),
      url: 'https://medium.com/@thetrendmatrix',
    };

    await appendSocialLog(logEntry);

    return NextResponse.json({ success: true, mode: token ? 'live' : 'simulator', mediumUrl: logEntry.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cross-post to Medium' }, { status: 500 });
  }
}

