import { NextResponse } from 'next/server';
import { resilientReadJson, atomicWriteJson } from '@/lib/atomic-storage';
import path from 'path';

export const dynamic = 'force-dynamic';

const AUTOMATIONS_PATH = path.join(process.cwd(), 'data', 'meta_automations.json');
const SOCIAL_LOG_PATH = path.join(process.cwd(), 'data', 'social_log.json');

/**
 * Meta Graph API Webhook Handshake (GET)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'nexus_meta_secret_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * Meta Incoming Comment Event Webhook (POST)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Load automations
    const automations = await resilientReadJson<any[]>(AUTOMATIONS_PATH, []);
    const logs = await resilientReadJson<any[]>(SOCIAL_LOG_PATH, []);

    // Extract comment and username from incoming Meta payload or simulated payload
    const commentText: string = body.commentText || body?.entry?.[0]?.changes?.[0]?.value?.text || '';
    const username: string = body.username || body?.entry?.[0]?.changes?.[0]?.value?.from?.username || 'user';
    const commentId: string = body.commentId || body?.entry?.[0]?.changes?.[0]?.value?.id || `comment_${Date.now()}`;
    const mediaId: string = body.mediaId || body?.entry?.[0]?.changes?.[0]?.value?.media?.id || 'post_default';

    if (!commentText) {
      return NextResponse.json({ success: true, message: 'No comment text detected' });
    }

    // Match automation by trigger keyword
    const matched = automations.find((a) => 
      a.isActive && commentText.toUpperCase().includes(a.triggerKeyword.toUpperCase())
    );

    if (!matched) {
      return NextResponse.json({ success: true, message: 'No matching keyword trigger found' });
    }

    // Format personalized DM
    const dmMessage = matched.dmTemplate
      .replace('{username}', username)
      .replace('{url}', matched.targetUrl);

    const isSimulated = !process.env.META_ACCESS_TOKEN;

    // If live credentials present, dispatch to Meta Graph API
    if (!isSimulated && process.env.META_ACCESS_TOKEN) {
      try {
        await fetch(`https://graph.facebook.com/v20.0/${process.env.META_PAGE_ID || 'me'}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { comment_id: commentId },
            message: { text: dmMessage },
          }),
        });
      } catch (apiErr) {
        console.error('[META GRAPH API ERROR]', apiErr);
      }
    }

    // Update automation stats
    matched.dmsSent = (matched.dmsSent || 0) + 1;
    await atomicWriteJson(AUTOMATIONS_PATH, automations);

    // Log to social activity
    const logEntry = {
      id: `meta-dm-${Date.now()}`,
      platform: 'Instagram/Facebook Auto-DM',
      title: `Keyword '${matched.triggerKeyword}' triggered by @${username}`,
      status: isSimulated ? 'simulated' : 'delivered',
      timestamp: new Date().toISOString(),
      url: matched.targetUrl,
      dmPreview: dmMessage,
      publicReply: matched.publicCommentReply,
    };
    logs.unshift(logEntry);
    await atomicWriteJson(SOCIAL_LOG_PATH, logs.slice(0, 50));

    return NextResponse.json({
      success: true,
      mode: isSimulated ? 'simulated' : 'live',
      matchedRule: matched.name,
      triggerKeyword: matched.triggerKeyword,
      sentTo: `@${username}`,
      dmDelivered: dmMessage,
      publicCommentReply: matched.publicCommentReply,
    });
  } catch (err: any) {
    console.error('[META WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failure' }, { status: 500 });
  }
}
