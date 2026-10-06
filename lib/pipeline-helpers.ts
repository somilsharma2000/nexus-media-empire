import fs from 'fs/promises';
import path from 'path';

// ─── File Paths ────────────────────────────────────────────────────────────
export const PIPELINE_LOG_PATH   = path.join(process.cwd(), 'data', 'pipeline_log.json');
export const PIPELINE_STATE_PATH = path.join(process.cwd(), 'data', 'pipeline_state.json');
export const ARTICLES_PATH       = path.join(process.cwd(), 'data', 'articles.json');

// ─── Types ─────────────────────────────────────────────────────────────────
export interface LogEntry {
  timestamp: string;
  step: string;
  status: 'success' | 'failure' | 'info';
  detail: string;
}

export interface StepState {
  status: 'active' | 'paused';
  consecutiveFailures: number;
  lastRun?: string;
}

export interface PipelineState {
  [step: string]: StepState;
}

export interface Article {
  id: number;
  title: string;
  category: string;
  time: string;
  excerpt: string;
  content: string;
  image: string;
  featured: boolean;
  status?: string;         // 'draft' | 'scheduled' | 'published' | 'flagged_for_pruning'
  publishAt?: string;      // ISO date
  publishedAt?: string;    // ISO date
  updatedAt?: string;      // ISO date
  slug?: string;
  niche?: string;
  viewCount?: number;
  qaStatus?: string;
  qaVerdict?: {
    verdict?: string;
    averageScore?: number;
    scores?: Record<string, number>;
  };
}

// ─── CRON Auth ─────────────────────────────────────────────────────────────
/**
 * Returns true when the request carries a valid CRON_SECRET Bearer token
 * OR when Vercel injects the x-vercel-cron header (production cron bypass).
 */
export function isAuthorised(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = req.headers.get('x-vercel-cron');
  if (vercelCron) return true; // Vercel platform-signed cron request
  if (!cronSecret) return false;
  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${cronSecret}`;
}

import {
  getArticles,
  saveArticles,
  getPipelineState,
  updatePipelineState,
  appendPipelineLog,
  getPipelineLogs,
} from './data-layer';

// ─── Pipeline Log ──────────────────────────────────────────────────────────
export async function readLog(): Promise<LogEntry[]> {
  return (await getPipelineLogs(500)) as LogEntry[];
}

export async function appendLog(entries: LogEntry[]): Promise<void> {
  for (const entry of entries) {
    await appendPipelineLog(entry);
  }
}

export async function log(step: string, status: LogEntry['status'], detail: string): Promise<void> {
  const entry: LogEntry = { timestamp: new Date().toISOString(), step, status, detail };
  await appendLog([entry]);
}

// ─── Pipeline State ────────────────────────────────────────────────────────
export async function readState(): Promise<PipelineState> {
  return await getPipelineState();
}

export async function writeState(state: PipelineState): Promise<void> {
  await updatePipelineState(state);
}

/**
 * Records a failure for a given step.  
 * If consecutiveFailures reaches 3, pauses the step and optionally fires a webhook alert.
 */
export async function recordFailure(step: string, detail: string): Promise<void> {
  const state = await readState();
  if (!state[step]) state[step] = { status: 'active', consecutiveFailures: 0 };
  state[step].consecutiveFailures += 1;

  if (state[step].consecutiveFailures >= 3) {
    state[step].status = 'paused';
    const alertMsg = `[PIPELINE ALERT] Step "${step}" has been PAUSED after 3 consecutive failures. Last error: ${detail}`;
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: alertMsg }),
        });
      } catch (e) {
        console.error('[Pipeline] Webhook delivery failed:', e);
      }
    } else {
      console.error(alertMsg);
    }
  }

  await writeState(state);
}

export async function recordSuccess(step: string): Promise<void> {
  const state = await readState();
  if (!state[step]) state[step] = { status: 'active', consecutiveFailures: 0 };
  state[step].consecutiveFailures = 0;
  state[step].lastRun = new Date().toISOString();
  await writeState(state);
}

// ─── Articles helpers ──────────────────────────────────────────────────────
export async function readArticles(): Promise<Article[]> {
  return (await getArticles()) as Article[];
}

export async function writeArticles(articles: Article[]): Promise<void> {
  await saveArticles(articles);
}

// ─── Similarity ────────────────────────────────────────────────────────────
/**
 * Word-overlap similarity: count common words / max(words in a, words in b).
 * Returns a value between 0 and 1.
 */
export function wordOverlapSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let common = 0;
  wa.forEach((w) => { if (wb.has(w)) common++; });
  return common / Math.max(wa.size, wb.size);
}

// ─── QA Review (inline, avoids circular HTTP) ──────────────────────────────
/**
 * Simple keyword-based QA review.
 * Returns { approved: boolean, reason: string }
 */
export function qaReview(content: string): { approved: boolean; reason: string } {
  if (!content || content.trim().length < 100) {
    return { approved: false, reason: 'Content too short (< 100 chars)' };
  }
  const lower = content.toLowerCase();
  const spamWords = ['buy now', 'click here', 'free money', 'guaranteed income'];
  for (const word of spamWords) {
    if (lower.includes(word)) {
      return { approved: false, reason: `Spam keyword detected: "${word}"` };
    }
  }
  return { approved: true, reason: 'Passed basic QA checks' };
}
