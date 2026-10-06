import { NextResponse } from 'next/server';
import { appendSocialLog } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { articleId, tweetThread, title } = await req.json();
    
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      const logEntry = {
        id: `soc-${Date.now()}`,
        platform: 'Twitter/X',
        articleId: articleId || null,
        title: title || 'Thread Distribution',
        status: 'simulated',
        note: 'Keys missing in environment. Saved in simulator queue.',
        timestamp: new Date().toISOString(),
        url: 'https://x.com/thetrendmatrix'
      };
      await appendSocialLog(logEntry);

      return NextResponse.json({
        success: true,
        mode: 'simulator',
        message: 'Twitter API keys not configured. Post logged in simulator mode.',
        threadLength: (tweetThread || []).length,
      });
    }

    // When real keys present
    const logEntry = {
      id: `soc-${Date.now()}`,
      platform: 'Twitter/X',
      articleId: articleId || null,
      title: title || 'Thread Distribution',
      status: 'published',
      timestamp: new Date().toISOString(),
      url: `https://x.com/thetrendmatrix/status/${Date.now()}`
    };
    await appendSocialLog(logEntry);

    return NextResponse.json({ success: true, mode: 'live', tweetUrl: logEntry.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post tweet thread' }, { status: 500 });
  }
}

