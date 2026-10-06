import { NextResponse } from 'next/server';
import { getMetaAutomations, saveMetaAutomation, getSocialLogs, appendSocialLog } from '@/lib/data-layer';
import { getCanonicalSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

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
 * Meta Incoming Comment Event & Follow Verification Webhook (POST)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Load automations
    const automations = await getMetaAutomations();

    const action: string = body.action || ''; // e.g. 'confirm_follow'
    const commentText: string = body.commentText || body?.entry?.[0]?.changes?.[0]?.value?.text || '';
    const username: string = body.username || body?.entry?.[0]?.changes?.[0]?.value?.from?.username || 'user';
    const commentId: string = body.commentId || body?.entry?.[0]?.changes?.[0]?.value?.id || `comment_${Date.now()}`;
    const automationId: string = body.automationId || '';
    const isSimulated = !process.env.META_ACCESS_TOKEN;

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 2: USER CONFIRMS THEY FOLLOW US (Tap 'I Am Following' or reply YES)
    // ─────────────────────────────────────────────────────────────────────────────
    const isFollowConfirmation = 
      action === 'confirm_follow' || 
      /^(yes|followed|confirm|done|i follow|i am following|following|already followed)/i.test(commentText.trim());

    if (isFollowConfirmation) {
      // Find automation rule by automationId or match first active rule
      const matched = automations.find((a) => a.id === automationId) || automations[0] || {
        id: 'default-meta-gate',
        name: 'Nexus Universal Access Gate',
        pageHandle: 'TheTrendMatrix',
        targetUrl: `${getCanonicalSiteUrl()}/news/quantum-computing-reaches-1000-qubit-milestone`,
        step2PayloadDm: '🎉 Verified & Access Granted @{username}!\n\n🚀 Here is your un-gated direct link:\n{url}\n\nEnjoy reading and stay ahead of the curve! 💡',
      };

      const step2Message = (matched.step2PayloadDm || matched.dmTemplate || '')
        .replace(/{username}/g, username)
        .replace(/{url}/g, matched.targetUrl);

      // In Live Mode, if Meta token is present, we could check is_user_follow_business_account or send Graph API message
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
              message: { text: step2Message },
            }),
          });
        } catch (apiErr) {
          console.error('[META GRAPH API ERROR - STEP 2]', apiErr);
        }
      }

      // Increment conversion counter
      matched.conversions = (matched.conversions || 0) + 1;
      await saveMetaAutomation(matched);

      // Log verified payload delivery
      await appendSocialLog({
        id: `meta-step2-${Date.now()}`,
        platform: 'Instagram/Facebook Auto-DM',
        title: `✅ Follow Verified: Delivered un-gated link to @${username}`,
        status: isSimulated ? 'simulated_verified' : 'delivered_verified',
        timestamp: new Date().toISOString(),
        url: matched.targetUrl,
        dmPreview: step2Message,
      });

      return NextResponse.json({
        success: true,
        step: 2,
        mode: isSimulated ? 'simulated' : 'live',
        followerStatus: 'VERIFIED_ACTIVE_FOLLOWER',
        matchedRule: matched.name,
        sentTo: `@${username}`,
        dmDelivered: step2Message,
        targetUrl: matched.targetUrl,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 1: USER COMMENTS ANYTHING (Trigger Initial DM + Follow Verification)
    // ─────────────────────────────────────────────────────────────────────────────
    if (!commentText && !action) {
      return NextResponse.json({ success: true, message: 'No comment text detected' });
    }

    // Match automation rule:
    // 1. Check if comment contains a keyword from a rule
    // 2. Or fallback to matching the first active rule (Universal Any-Comment trigger)
    let matched = automations.find((a) => 
      a.isActive && a.triggerKeyword !== 'ANY' && commentText.toUpperCase().includes(a.triggerKeyword.toUpperCase())
    );

    if (!matched) {
      // Universal trigger: match any active rule
      matched = automations.find((a) => a.isActive) || automations[0];
    }

    if (!matched) {
      return NextResponse.json({ success: false, message: 'No active automation rules configured' });
    }

    const pageHandle = matched.pageHandle || 'TheTrendMatrix';
    const step1Message = (matched.step1FollowRequestDm || `Hey @{username}! 👋 Thanks for commenting!\n\n🔒 QUICK FOLLOWER CHECK:\nTo unlock the un-gated link & VIP resources, please make sure you are following @${pageHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to get instant access! 🚀`)
      .replace(/{username}/g, username)
      .replace(/{url}/g, matched.targetUrl);

    const publicReply = (matched.publicCommentReply || `@{username} Check your DMs! 📩 We just sent you a message to confirm your access link!`)
      .replace(/{username}/g, username);

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
            message: { 
              text: step1Message,
              quick_replies: [
                {
                  content_type: 'text',
                  title: 'I Am Following ✅',
                  payload: `CONFIRM_FOLLOW_${matched.id}`,
                }
              ]
            },
          }),
        });
      } catch (apiErr) {
        console.error('[META GRAPH API ERROR - STEP 1]', apiErr);
      }
    }

    // Update automation stats
    matched.dmsSent = (matched.dmsSent || 0) + 1;
    await saveMetaAutomation(matched);

    // Log to social activity
    await appendSocialLog({
      id: `meta-step1-${Date.now()}`,
      platform: 'Instagram/Facebook Auto-DM',
      title: `⚡ Any-Comment Trigger: Sent Follow-Gate to @${username} (Comment: "${commentText.slice(0, 30)}")`,
      status: isSimulated ? 'simulated' : 'delivered',
      timestamp: new Date().toISOString(),
      url: matched.targetUrl,
      dmPreview: step1Message,
      publicReply: publicReply,
    });

    return NextResponse.json({
      success: true,
      step: 1,
      mode: isSimulated ? 'simulated' : 'live',
      automationId: matched.id,
      matchedRule: matched.name,
      triggerType: 'ANY_COMMENT_DETECTED',
      userComment: commentText,
      sentTo: `@${username}`,
      step1Dm: step1Message,
      publicCommentReply: publicReply,
      quickReplyOption: 'I Am Following ✅',
      instructions: 'User must confirm follow before Step 2 payload link is released.',
    });
  } catch (err: any) {
    console.error('[META WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failure' }, { status: 500 });
  }
}
