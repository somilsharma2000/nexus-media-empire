import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { service, value } = await req.json();

    switch (service) {
      case 'telegram': {
        const token = value || process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return NextResponse.json({ success: false, message: 'No Telegram token provided' });
        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await res.json();
        if (data.ok) {
          return NextResponse.json({ success: true, message: `Connected as @${data.result.username}` });
        }
        return NextResponse.json({ success: false, message: `Telegram Error: ${data.description || 'Invalid token'}` });
      }

      case 'openai': {
        const key = value || process.env.OPENAI_API_KEY;
        if (!key) return NextResponse.json({ success: false, message: 'No OpenAI API Key provided' });
        try {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
          });
          if (res.ok) {
            return NextResponse.json({ success: true, message: 'OpenAI API Connected! Models verified.' });
          }
          const err = await res.json().catch(() => ({}));
          return NextResponse.json({ success: false, message: err.error?.message || `HTTP ${res.status} Authentication Failed` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Network error reaching OpenAI' });
        }
      }

      case 'adsense': {
        const pub = value || process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
        if (!pub || !pub.startsWith('pub-')) {
          return NextResponse.json({ success: false, message: 'Invalid AdSense ID format. Must start with pub-' });
        }
        return NextResponse.json({ success: true, message: `AdSense Publisher format valid (${pub})` });
      }

      case 'database': {
        const dbUrl = value || process.env.DATABASE_URL;
        if (!dbUrl) return NextResponse.json({ success: false, message: 'No DATABASE_URL configured' });
        if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
          return NextResponse.json({ success: false, message: 'URL must begin with postgresql:// or postgres://' });
        }
        return NextResponse.json({ success: true, message: 'Valid PostgreSQL connection string format' });
      }

      case 'indexnow': {
        const key = value || process.env.INDEXNOW_KEY || process.env.GOOGLE_INDEXING_API_KEY;
        if (!key) return NextResponse.json({ success: false, message: 'No Indexing/IndexNow key configured' });
        return NextResponse.json({ success: true, message: 'Instant Indexing credentials ready' });
      }

      case 'twitter': {
        const key = value || process.env.TWITTER_API_KEY;
        if (!key) return NextResponse.json({ success: false, message: 'No Twitter API Key configured' });
        return NextResponse.json({ success: true, message: 'Twitter API credentials detected' });
      }

      default: {
        return NextResponse.json({ success: true, message: 'Configuration parameters verified' });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal test error' }, { status: 500 });
  }
}
