import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!token) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_TOKEN is not configured' },
      { status: 503 }
    );
  }

  if (!siteUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_SITE_URL is not configured' },
      { status: 503 }
    );
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );

    const data = (await res.json()) as { ok: boolean; description?: string };

    if (!data.ok) {
      return NextResponse.json(
        { success: false, error: data.description ?? 'Unknown Telegram error' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, webhookUrl });
  } catch (err) {
    console.error('[Telegram Setup] setWebhook error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
