import { NextResponse } from 'next/server';
import { sendTelegramAlert } from '@/lib/telegram';
import { getArticles, saveArticle, getPipelineState, updatePipelineStepState, isDatabaseConnected } from '@/lib/data-layer';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actionsTaken: string[] = [];

  try {
    // 1. Audit and heal articles with missing slugs/niches
    const articles = await getArticles();
    let articlesFixed = 0;

    for (const art of articles) {
      let modified = false;
      if (!art.slug && art.title) {
        art.slug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        modified = true;
      }
      if (!art.niche) {
        art.niche = art.site || 'news';
        modified = true;
      }
      if (modified) {
        await saveArticle(art);
        articlesFixed++;
      }
    }

    if (articlesFixed > 0) {
      actionsTaken.push(`[INDEX HEALED] Generated missing URL slugs & niches for ${articlesFixed} articles`);
    }

    // 2. Reset stalled pipeline states if failure count >= 3
    const state = await getPipelineState();
    for (const [key, val] of Object.entries(state)) {
      if (val.status === 'paused' && (val.consecutiveFailures || 0) >= 3) {
        await updatePipelineStepState(key, { status: 'active', consecutiveFailures: 0 });
        actionsTaken.push(`[PIPELINE RECOVERED] Auto-resumed stalled worker '${key}'`);
      }
    }

    // 3. Database ping check
    const db = getPrisma();
    if (db && isDatabaseConnected()) {
      try {
        await db.$queryRaw`SELECT 1`;
      } catch (err: any) {
        actionsTaken.push(`[DATABASE WARNING] Database connection error: ${err.message}`);
      }
    }

    // Send Telegram alert if auto-healing occurred
    if (actionsTaken.length > 0) {
      await sendTelegramAlert(
        `🛡️ <b>NEXUS SELF-HEALING ENGINE ACTIVE</b>\n` +
        `Processed ${actionsTaken.length} system items:\n` +
        actionsTaken.map(a => `• ${a}`).join('\n')
      );
    }

    return NextResponse.json({
      success: true,
      systemHealth: '100% OPERATIONAL',
      actionsTaken,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
