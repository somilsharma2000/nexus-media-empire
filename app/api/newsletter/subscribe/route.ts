import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { addNewsletterSubscriber } from '@/lib/data-layer';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetMs);
  }

  try {
    const { email, niche } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetNiche = niche || 'general';

    // 1. Dual-Layer Storage: Persist via data layer (DB + Local Storage)
    await addNewsletterSubscriber(cleanEmail, targetNiche);

    // 2. Read Beehiiv credentials from env or settings.json
    let beehiivApiKey = process.env.BEEHIIV_API_KEY;
    let beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;

    try {
      const rawSettings = await fs.readFile(SETTINGS_PATH, 'utf-8');
      const settings = JSON.parse(rawSettings);
      if (settings.BEEHIIV_API_KEY) beehiivApiKey = settings.BEEHIIV_API_KEY;
      if (settings.BEEHIIV_PUBLICATION_ID) beehiivPubId = settings.BEEHIIV_PUBLICATION_ID;
    } catch {
      // Ignore if settings.json not found
    }

    // 3. If Beehiiv API is configured, push subscription to Beehiiv v2 API
    let beehiivSynced = false;
    if (beehiivApiKey && beehiivPubId) {
      try {
        const beehiivRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${beehiivApiKey}`,
            },
            body: JSON.stringify({
              email: cleanEmail,
              reactivate_existing: true,
              send_welcome_email: true,
              utm_source: 'nexus-media-empire',
              utm_medium: 'organic-article-capture',
              custom_fields: [
                {
                  name: 'Niche Channel',
                  value: targetNiche,
                },
              ],
            }),
          }
        );

        if (beehiivRes.ok) {
          beehiivSynced = true;
          console.log(`[Beehiiv] Successfully synced subscriber: ${cleanEmail}`);
        } else {
          const errText = await beehiivRes.text();
          console.warn(`[Beehiiv API Warning] Status: ${beehiivRes.status} - ${errText}`);
        }
      } catch (err) {
        console.error('[Beehiiv API Network Error]', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully!',
      beehiivSynced,
    });
  } catch (error) {
    console.error('[Subscribe Error]', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
