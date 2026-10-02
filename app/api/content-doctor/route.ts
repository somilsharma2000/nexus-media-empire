import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import {
  isAuthorised,
  readArticles,
  writeArticles,
  log,
  qaReview,
  Article,
} from '@/lib/pipeline-helpers';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const DOCTOR_LOG_PATH = path.join(process.cwd(), 'data', 'content_doctor_log.json');

interface DoctorLogEntry {
  timestamp: string;
  mode: string;
  articleId: number;
  title: string;
  status: string;
  detail: string;
}

async function readDoctorLog(): Promise<DoctorLogEntry[]> {
  try {
    const raw = await fs.readFile(DOCTOR_LOG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function appendDoctorLog(entry: DoctorLogEntry): Promise<void> {
  const existing = await readDoctorLog();
  existing.push(entry);
  await fs.writeFile(DOCTOR_LOG_PATH, JSON.stringify(existing.slice(-200), null, 2));
}

export async function POST(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { mode } = body as { mode: 'refresh' | 'prune' };

  if (!mode || !['refresh', 'prune'].includes(mode)) {
    return NextResponse.json(
      { error: 'Invalid body. Required: { mode: "refresh" | "prune" }' },
      { status: 400 }
    );
  }

  const articles = await readArticles();
  const now = new Date();

  // ── MODE: REFRESH ──────────────────────────────────────────────────────────
  if (mode === 'refresh') {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });
    }

    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const eligible = articles.filter(
      (a) =>
        a.status === 'published' &&
        a.publishedAt &&
        new Date(a.publishedAt) < sixtyDaysAgo
    );

    // Max 3 per run to control costs
    const toRefresh = eligible.slice(0, 3);

    if (toRefresh.length === 0) {
      return NextResponse.json({ mode, refreshed: 0, message: 'No articles eligible for refresh' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const results: { title: string; status: string; changesSummary?: string }[] = [];

    for (const article of toRefresh) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 3000,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert editor refreshing articles for accuracy. Return ONLY valid JSON.',
            },
            {
              role: 'user',
              content: `Update this article. Keep the exact H1 title and URL slug. Update: statistics, dates, examples, factual claims. Add an Updated On line at the very top. Return JSON: { "updatedArticle": string, "changesSummary": string }\n\nARTICLE:\n${article.content}`,
            },
          ],
          response_format: { type: 'json_object' },
        });

        const parsed = JSON.parse(completion.choices[0].message.content || '{}');
        const updatedContent: string = parsed.updatedArticle || article.content;
        const changesSummary: string = parsed.changesSummary || 'Minor updates applied';

        // Run through QA
        const qa = qaReview(updatedContent);

        if (!qa.approved) {
          await appendDoctorLog({
            timestamp: now.toISOString(),
            mode: 'refresh',
            articleId: article.id,
            title: article.title,
            status: 'qa_rejected',
            detail: qa.reason,
          });
          results.push({ title: article.title, status: 'qa_rejected' });
          continue;
        }

        // Apply update to article in articles array
        const idx = articles.findIndex((a) => a.id === article.id);
        if (idx !== -1) {
          const todayStr = now.toISOString().split('T')[0];
          articles[idx].content = `**Updated on ${todayStr}:** ${changesSummary}\n\n---\n\n${updatedContent}`;
          articles[idx].updatedAt = now.toISOString();
        }

        await log('content_doctor', 'success', `Refreshed article: "${article.title}"`);
        await appendDoctorLog({
          timestamp: now.toISOString(),
          mode: 'refresh',
          articleId: article.id,
          title: article.title,
          status: 'refreshed',
          detail: changesSummary,
        });
        results.push({ title: article.title, status: 'refreshed', changesSummary });
      } catch (err: any) {
        const msg = `Refresh failed for "${article.title}": ${err.message}`;
        await log('content_doctor', 'failure', msg);
        await appendDoctorLog({
          timestamp: now.toISOString(),
          mode: 'refresh',
          articleId: article.id,
          title: article.title,
          status: 'error',
          detail: err.message,
        });
        results.push({ title: article.title, status: 'error' });
      }
    }

    await writeArticles(articles);
    return NextResponse.json({ mode, refreshed: results.filter((r) => r.status === 'refreshed').length, results });
  }

  // ── MODE: PRUNE ────────────────────────────────────────────────────────────
  if (mode === 'prune') {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const toPrune = articles.filter(
      (a) =>
        a.status === 'published' &&
        a.publishedAt &&
        new Date(a.publishedAt) < ninetyDaysAgo &&
        (a.viewCount === 0 || a.viewCount === undefined) === false
          ? a.viewCount === 0
          : a.viewCount === undefined
          ? false // skip articles without viewCount field
          : a.viewCount === 0
    );

    // Simplified prune filter
    const pruneEligible = articles.filter((a) => {
      if (a.status !== 'published') return false;
      if (!a.publishedAt) return false;
      if (new Date(a.publishedAt) >= ninetyDaysAgo) return false;
      if (!('viewCount' in a)) return false; // skip if field missing
      if (a.viewCount !== 0) return false;
      return true;
    });

    const flagged: Article[] = [];
    pruneEligible.forEach((a) => {
      const idx = articles.findIndex((art) => art.id === a.id);
      if (idx !== -1) {
        articles[idx].status = 'flagged_for_pruning';
        flagged.push(articles[idx]);
      }
    });

    await writeArticles(articles);

    for (const a of flagged) {
      await appendDoctorLog({
        timestamp: now.toISOString(),
        mode: 'prune',
        articleId: a.id,
        title: a.title,
        status: 'flagged_for_pruning',
        detail: 'Published > 90 days ago with 0 views',
      });
    }

    await log('content_doctor', 'info', `Pruning: flagged ${flagged.length} articles`);

    return NextResponse.json({
      mode,
      flaggedCount: flagged.length,
      flaggedArticles: flagged.map((a) => ({ id: a.id, title: a.title, publishedAt: a.publishedAt })),
    });
  }

  return NextResponse.json({ error: 'Unhandled mode' }, { status: 400 });
}

// Allow GET so Vercel cron also works (passes mode via query param)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') as 'refresh' | 'prune' | null;
  const newReq = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ mode: mode || 'refresh' }),
  });
  return POST(newReq);
}
