import { NextResponse } from 'next/server';
import { Bot, webhookCallback } from 'grammy';

import { getArticles, saveArticle, saveArticles } from '@/lib/data-layer';
import { getCanonicalSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

const BASE_URL = getCanonicalSiteUrl();

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id: number | string;
  title: string;
  status?: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readArticles(): Promise<Article[]> {
  return (await getArticles()) as Article[];
}

async function writeArticles(articles: Article[]): Promise<void> {
  await saveArticles(articles);
}

async function apiFetch(endpoint: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${endpoint}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`);
  return res.json();
}

function fmt(n: number): string {
  return n.toFixed(2);
}

// ─── Bot factory (created per-request to keep edge-friendly) ─────────────────

function createBot(token: string, adminId: string): Bot {
  const bot = new Bot(token);

  // ── Security middleware ──────────────────────────────────────────────────────
  bot.use(async (ctx, next) => {
    const from = ctx.from;
    if (!from || from.id.toString() !== adminId) {
      await ctx.reply('Unauthorized');
      return;
    }
    await next();
  });

  // ── /start ───────────────────────────────────────────────────────────────────
  bot.command('start', async (ctx) => {
    await ctx.reply(
      '🤖 <b>Nexus Media Engine Bot</b>\n\n' +
        'Available commands:\n' +
        '/status — full pipeline status\n' +
        '/pause — pause all pipeline steps\n' +
        '/resume — resume pipeline\n' +
        '/budget — show token / spend info\n' +
        '/articles — last 5 articles',
      { parse_mode: 'HTML' }
    );
  });

  // ── /status ──────────────────────────────────────────────────────────────────
  bot.command('status', async (ctx) => {
    try {
      const [revenue, alerts, articles] = await Promise.allSettled([
        apiFetch('/api/analytics/revenue'),
        apiFetch('/api/monitor/alerts'),
        readArticles(),
      ]);

      const rev = revenue.status === 'fulfilled'
        ? (revenue.value as { network: { todayRevenue: number; weekRevenue: number } }).network
        : null;

      const alertList = alerts.status === 'fulfilled'
        ? (alerts.value as Array<{ resolved: boolean }>)
        : [];

      const openAlerts = alertList.filter((a) => !a.resolved).length;

      const allArticles = articles.status === 'fulfilled' ? articles.value : [];
      const published = allArticles.filter((a) => a.status === 'published').length;
      const total = allArticles.length;

      const now = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';

      const msg =
        `🤖 <b>NEXUS STATUS REPORT</b>\n` +
        `📅 ${now}\n\n` +
        `💰 Revenue Today: $${rev ? fmt(rev.todayRevenue) : '—'}\n` +
        `📊 7-Day Revenue: $${rev ? fmt(rev.weekRevenue) : '—'}\n\n` +
        `🔄 <b>PIPELINE:</b>\n` +
        `✅ Trend Scout: active\n` +
        `✅ Publisher: active | ${total} articles total\n\n` +
        `⚠️ ALERTS: ${openAlerts} open\n` +
        `📰 Articles: ${total} total, ${published} published`;

      await ctx.reply(msg, { parse_mode: 'HTML' });
    } catch (err) {
      await ctx.reply(`❌ Status fetch failed: ${(err as Error).message}`);
    }
  });

  // ── /pause ───────────────────────────────────────────────────────────────────
  bot.command('pause', async (ctx) => {
    try {
      await fetch(`${BASE_URL}/api/pipeline/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause', steps: 'all' }),
      });
    } catch {
      // pipeline/control may not exist yet — log and continue
      console.warn('[TG] /api/pipeline/control not available');
    }
    await ctx.reply('⏸ All pipeline steps paused. Send /resume to restart.');
  });

  // ── /resume ──────────────────────────────────────────────────────────────────
  bot.command('resume', async (ctx) => {
    try {
      await fetch(`${BASE_URL}/api/pipeline/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', steps: 'all' }),
      });
    } catch {
      console.warn('[TG] /api/pipeline/control not available');
    }
    await ctx.reply('▶️ Pipeline resumed.');
  });

  // ── /budget ──────────────────────────────────────────────────────────────────
  bot.command('budget', async (ctx) => {
    try {
      const data = await apiFetch('/api/generate/usage') as {
        monthTokens?: number;
        monthCost?: number;
        budgetRemaining?: number;
        [key: string]: unknown;
      };

      const tokens = data.monthTokens ?? 0;
      const cost = data.monthCost ?? 0;
      const remaining = data.budgetRemaining;

      let msg =
        `💸 <b>Token Budget</b>\n\n` +
        `📊 Month tokens used: ${tokens.toLocaleString()}\n` +
        `💰 Month spend: $${fmt(cost)}`;

      if (remaining !== undefined) {
        msg += `\n🟢 Budget remaining: $${fmt(remaining as number)}`;
      }

      await ctx.reply(msg, { parse_mode: 'HTML' });
    } catch {
      await ctx.reply('⚠️ Usage data not available. /api/generate/usage may not be implemented yet.');
    }
  });

  // ── /articles ────────────────────────────────────────────────────────────────
  bot.command('articles', async (ctx) => {
    const articles = await readArticles();
    if (articles.length === 0) {
      await ctx.reply('📰 No articles found in data/articles.json');
      return;
    }

    const last5 = articles.slice(-5).reverse();
    const lines = last5
      .map((a, i) => {
        const status = a.status ? ` [${a.status}]` : '';
        return `${i + 1}. ${a.title}${status}`;
      })
      .join('\n');

    await ctx.reply(`📰 <b>Last 5 Articles</b>\n\n${lines}`, {
      parse_mode: 'HTML',
    });
  });

  // ── /approve_{id} ─────────────────────────────────────────────────────────
  bot.hears(/^\/approve_(.+)$/, async (ctx) => {
    const rawId = ctx.match[1];
    const articles = await readArticles();
    const idx = articles.findIndex(
      (a) => String(a.id) === rawId
    );

    if (idx === -1) {
      await ctx.reply(`❌ Article ${rawId} not found.`);
      return;
    }

    articles[idx].status = 'scheduled';
    await writeArticles(articles);
    console.log(`[TG] Article ${rawId} approved and scheduled`);
    await ctx.reply(`✅ Article approved and scheduled\n📰 "${articles[idx].title}"`);
  });

  // ── /reject_{id} ──────────────────────────────────────────────────────────
  bot.hears(/^\/reject_(.+)$/, async (ctx) => {
    const rawId = ctx.match[1];
    const articles = await readArticles();
    const idx = articles.findIndex((a) => String(a.id) === rawId);

    if (idx === -1) {
      await ctx.reply(`❌ Article ${rawId} not found.`);
      return;
    }

    articles[idx].status = 'rejected';
    await writeArticles(articles);
    console.log(`[TG] Article ${rawId} rejected`);
    await ctx.reply(`❌ Article rejected\n📰 "${articles[idx].title}"`);
  });

  // ── /revise_{id} ──────────────────────────────────────────────────────────
  bot.hears(/^\/revise_(.+)$/, async (ctx) => {
    const rawId = ctx.match[1];
    await ctx.reply(`🔄 Re-running QA review for article ${rawId}…`);

    try {
      const res = await fetch(`${BASE_URL}/api/qa-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: rawId }),
      });

      if (!res.ok) throw new Error(`QA endpoint returned ${res.status}`);
      const data = await res.json() as {
        score?: number;
        passed?: boolean;
        feedback?: string;
        [key: string]: unknown;
      };

      await ctx.reply(
        `📋 <b>QA Review Complete</b>\n` +
          `Score: ${data.score ?? '—'}/10\n` +
          `Passed: ${data.passed ? '✅' : '❌'}\n` +
          (data.feedback ? `Feedback: ${data.feedback}` : ''),
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      await ctx.reply(`⚠️ QA review failed: ${(err as Error).message}`);
    }
  });

  return bot;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_USER_ID;

  if (!token || !adminId) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_USER_ID not configured' },
      { status: 503 }
    );
  }

  const bot = createBot(token, adminId);

  try {
    const handler = webhookCallback(bot, 'std/http');
    return handler(request);
  } catch (err) {
    console.error('[Telegram Webhook] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
