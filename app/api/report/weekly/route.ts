import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isAuthorised, readArticles, readLog } from '@/lib/pipeline-helpers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALERTS_PATH       = path.join(process.cwd(), 'data', 'alerts.json');
const DOCTOR_LOG_PATH   = path.join(process.cwd(), 'data', 'content_doctor_log.json');

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
  createdAt: string;
}

interface DoctorLogEntry {
  timestamp: string;
  mode: string;
  articleId: number;
  title: string;
  status: string;
  detail: string;
}

async function readAlerts(): Promise<Alert[]> {
  try {
    const raw = await fs.readFile(ALERTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function readDoctorLog(): Promise<DoctorLogEntry[]> {
  try {
    const raw = await fs.readFile(DOCTOR_LOG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStart = sevenDaysAgo.toISOString();

  const [articles, pipelineLog, allAlerts, doctorLog] = await Promise.all([
    readArticles(),
    readLog(),
    readAlerts(),
    readDoctorLog(),
  ]);

  // ── Articles published this week ───────────────────────────────────────
  const publishedThisWeek = articles.filter(
    (a) =>
      a.status === 'published' &&
      a.publishedAt &&
      new Date(a.publishedAt) >= sevenDaysAgo
  );

  // ── Articles updated by Content Doctor this week ───────────────────────
  const updatedThisWeek = doctorLog.filter(
    (e) => e.status === 'refreshed' && new Date(e.timestamp) >= sevenDaysAgo
  );

  // ── Alerts from last 7 days ────────────────────────────────────────────
  const recentAlerts = allAlerts.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  );

  // ── Pipeline failures this week ────────────────────────────────────────
  const pipelineFailures = pipelineLog.filter(
    (e) => e.status === 'failure' && new Date(e.timestamp) >= sevenDaysAgo
  );

  const report = {
    generatedAt: now.toISOString(),
    weekStart,
    weekEnd: now.toISOString(),
    publishedThisWeek: {
      count: publishedThisWeek.length,
      titles: publishedThisWeek.map((a) => a.title),
    },
    contentDoctorUpdates: {
      count: updatedThisWeek.length,
      articles: updatedThisWeek.map((e) => ({ title: e.title, changesSummary: e.detail })),
    },
    alerts: {
      count: recentAlerts.length,
      items: recentAlerts.map((a) => ({
        type: a.type,
        message: a.message,
        severity: a.severity,
        resolved: a.resolved,
        createdAt: a.createdAt,
      })),
    },
    pipelineFailures: {
      count: pipelineFailures.length,
      items: pipelineFailures.map((e) => ({
        step: e.step,
        detail: e.detail,
        timestamp: e.timestamp,
      })),
    },
  };

  // ── Optional webhook delivery ──────────────────────────────────────────
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📰 *Weekly Media Empire Report* — ${now.toDateString()}\n` +
            `• Published: ${report.publishedThisWeek.count} articles\n` +
            `• Refreshed by AI Doctor: ${report.contentDoctorUpdates.count}\n` +
            `• Alerts: ${report.alerts.count}\n` +
            `• Pipeline failures: ${report.pipelineFailures.count}`,
          report,
        }),
      });
    } catch (webhookErr) {
      console.error('[Weekly Report] Webhook delivery failed:', webhookErr);
    }
  }

  return NextResponse.json(report);
}

// Allow GET so Vercel cron also works
export async function GET(req: Request) {
  return POST(req);
}
