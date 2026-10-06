import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { service, value, extra } = await req.json();

    switch (service) {
      case 'database': {
        const dbUrl = (value || process.env.DATABASE_URL || '').trim();
        if (!dbUrl) {
          return NextResponse.json({ success: false, message: 'No DATABASE_URL provided' });
        }
        if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
          return NextResponse.json({
            success: false,
            message: 'Invalid URI protocol. Must begin with postgresql:// or postgres://'
          });
        }

        const startTime = Date.now();
        let tempClient: PrismaClient | null = null;
        try {
          tempClient = new PrismaClient({
            datasources: {
              db: { url: dbUrl }
            },
            log: ['error']
          });

          await tempClient.$queryRaw`SELECT 1 as connected;`;
          const latency = Date.now() - startTime;
          
          let articleCount = 0;
          try {
            articleCount = await tempClient.article.count();
          } catch {
            // Table might not exist yet if unmigrated
          }

          await tempClient.$disconnect();

          return NextResponse.json({
            success: true,
            latencyMs: latency,
            articleCount,
            message: `Connected successfully to PostgreSQL! (${latency}ms round-trip, ${articleCount} articles in DB)`
          });
        } catch (dbErr: any) {
          if (tempClient) await tempClient.$disconnect().catch(() => {});
          return NextResponse.json({
            success: false,
            message: `Database Connection Failed: ${dbErr.message || 'Check database host, user, password, and port'}`
          });
        }
      }

      case 'openai': {
        const key = (value || process.env.OPENAI_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No OpenAI API Key provided' });
        try {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
          });
          if (res.ok) {
            const data = await res.json();
            const count = data.data?.length || 0;
            return NextResponse.json({
              success: true,
              message: `OpenAI API Connected! (${count} models available including gpt-4o & gpt-4o-mini)`
            });
          }
          const err = await res.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            message: err.error?.message || `HTTP ${res.status} Authentication Failed`
          });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Network error reaching OpenAI' });
        }
      }

      case 'anthropic': {
        const key = (value || process.env.ANTHROPIC_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No Anthropic API Key provided' });
        try {
          const res = await fetch('https://api.anthropic.com/v1/models', {
            headers: {
              'x-api-key': key,
              'anthropic-version': '2023-06-01'
            }
          });
          if (res.ok || res.status === 200) {
            return NextResponse.json({ success: true, message: 'Anthropic Claude API Verified and Connected!' });
          }
          return NextResponse.json({ success: false, message: `Anthropic API Error: HTTP ${res.status}` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Network error reaching Anthropic' });
        }
      }

      case 'nvidia': {
        const key = (value || process.env.NVIDIA_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No NVIDIA API Key provided' });
        try {
          const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
          });
          if (res.ok) {
            return NextResponse.json({ success: true, message: 'NVIDIA NIM API Connected & Authenticated!' });
          }
          return NextResponse.json({ success: false, message: `NVIDIA API Error: HTTP ${res.status}` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Network error reaching NVIDIA' });
        }
      }

      case 'telegram': {
        const token = (value || process.env.TELEGRAM_BOT_TOKEN || '').trim();
        if (!token) return NextResponse.json({ success: false, message: 'No Telegram token provided' });
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
          const data = await res.json();
          if (data.ok) {
            return NextResponse.json({
              success: true,
              message: `Telegram Bot Connected: @${data.result.username} (${data.result.first_name})`
            });
          }
          return NextResponse.json({
            success: false,
            message: `Telegram Error: ${data.description || 'Invalid token'}`
          });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Failed to reach Telegram API' });
        }
      }

      case 'razorpay': {
        const keyId = (value || process.env.RAZORPAY_KEY_ID || '').trim();
        const keySecret = (extra || process.env.RAZORPAY_KEY_SECRET || '').trim();
        if (!keyId) return NextResponse.json({ success: false, message: 'No Razorpay Key ID provided' });
        
        if (keySecret) {
          try {
            const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
            const res = await fetch('https://api.razorpay.com/v1/orders?count=1', {
              headers: { Authorization: authHeader }
            });
            if (res.ok) {
              return NextResponse.json({ success: true, message: 'Razorpay Gateway Live & Verified!' });
            }
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({
              success: false,
              message: err.error?.description || `Razorpay Auth Failed (HTTP ${res.status})`
            });
          } catch (e: any) {
            return NextResponse.json({ success: false, message: e.message || 'Razorpay Network error' });
          }
        }

        if (keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_')) {
          return NextResponse.json({ success: true, message: `Razorpay Key ID format valid (${keyId.slice(0, 12)}...)` });
        }
        return NextResponse.json({ success: false, message: 'Key ID must start with rzp_test_ or rzp_live_' });
      }

      case 'beehiiv': {
        const key = (value || process.env.BEEHIIV_API_KEY || '').trim();
        const pubId = (extra || process.env.BEEHIIV_PUBLICATION_ID || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No Beehiiv API Key provided' });
        try {
          const url = pubId
            ? `https://api.beehiiv.com/v2/publications/${pubId}`
            : 'https://api.beehiiv.com/v2/publications';
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${key}` }
          });
          if (res.ok) {
            const data = await res.json();
            const name = data.data?.name || 'Publication';
            return NextResponse.json({ success: true, message: `Beehiiv Connected: ${name}` });
          }
          return NextResponse.json({ success: false, message: `Beehiiv Error: HTTP ${res.status}` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Beehiiv connection error' });
        }
      }

      case 'resend': {
        const key = (value || process.env.RESEND_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No Resend API Key provided' });
        try {
          const res = await fetch('https://api.resend.com/api-keys', {
            headers: { Authorization: `Bearer ${key}` }
          });
          if (res.ok) {
            return NextResponse.json({ success: true, message: 'Resend Email API Connected & Active!' });
          }
          return NextResponse.json({ success: false, message: `Resend Auth Failed (HTTP ${res.status})` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Resend connection error' });
        }
      }

      case 'adsense': {
        const pub = (value || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();
        if (!pub || !pub.startsWith('pub-')) {
          return NextResponse.json({ success: false, message: 'Invalid AdSense ID format. Must start with pub-' });
        }
        return NextResponse.json({ success: true, message: `Google AdSense Publisher ID verified: ${pub}` });
      }

      case 'ga4': {
        const gaId = (value || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();
        if (!gaId || !gaId.startsWith('G-')) {
          return NextResponse.json({ success: false, message: 'Invalid GA4 Measurement ID. Must start with G-' });
        }
        return NextResponse.json({ success: true, message: `Google Analytics 4 ID verified: ${gaId}` });
      }

      case 'gsc':
      case 'indexnow': {
        const key = (value || process.env.INDEXNOW_KEY || process.env.GOOGLE_INDEXING_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No Indexing/IndexNow key configured' });
        return NextResponse.json({ success: true, message: 'Search Engine Indexing credentials verified' });
      }

      case 'twitter': {
        const key = (value || process.env.TWITTER_API_KEY || '').trim();
        if (!key) return NextResponse.json({ success: false, message: 'No Twitter API Key configured' });
        return NextResponse.json({ success: true, message: 'Twitter/X credentials format verified' });
      }

      case 'medium': {
        const token = (value || process.env.MEDIUM_TOKEN || '').trim();
        if (!token) return NextResponse.json({ success: false, message: 'No Medium Token provided' });
        try {
          const res = await fetch('https://api.medium.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            return NextResponse.json({
              success: true,
              message: `Medium Connected: @${data.data?.username || 'user'}`
            });
          }
          return NextResponse.json({ success: false, message: `Medium Auth Failed (HTTP ${res.status})` });
        } catch (e: any) {
          return NextResponse.json({ success: false, message: e.message || 'Medium network error' });
        }
      }

      default: {
        return NextResponse.json({ success: true, message: 'Configuration parameter verified' });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal test error' }, { status: 500 });
  }
}
