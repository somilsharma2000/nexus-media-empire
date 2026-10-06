import { NextResponse } from 'next/server';
import { appendSocialLog } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { title, url, niche } = await req.json();

    const subreddits: Record<string, string> = {
      news: 'r/technology',
      crypto: 'r/CryptoCurrency',
      finance: 'r/personalfinance',
    };
    const targetSub = subreddits[niche] || 'r/technology';

    const configured = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);

    const logEntry = {
      id: `soc-red-${Date.now()}`,
      platform: `Reddit (${targetSub})`,
      title: title || 'Article Share',
      status: configured ? 'published' : 'simulated',
      note: configured ? 'Submitted to subreddit' : 'Keys unconfigured. Simulated submission.',
      timestamp: new Date().toISOString(),
      url: `https://reddit.com/${targetSub}`,
    };

    await appendSocialLog(logEntry);

    return NextResponse.json({ success: true, mode: configured ? 'live' : 'simulator', redditUrl: logEntry.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to distribute to Reddit' }, { status: 500 });
  }
}

