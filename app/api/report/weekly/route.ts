import { NextResponse } from 'next/server';
import { isAuthorised } from '@/lib/pipeline-helpers';
import { getArticles, getPipelineLogs, getAlerts, getContentDoctorLogs } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStart = sevenDaysAgo.toISOString();

  const [articles, pipelineLog, allAlerts, doctorLog] = await Promise.all([
    getArticles(),
    getPipelineLogs(100),
    getAlerts(100),
    getContentDoctorLogs(100),
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
    (e) => (e.action === 'refreshed' || e.status === 'refreshed') && new Date(e.timestamp) >= sevenDaysAgo
  );

  // ── Alerts from last 7 days ────────────────────────────────────────────
  const recentAlerts = allAlerts.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  );

  // ── Pipeline failures this week ────────────────────────────────────────
  const pipelineFailures = pipelineLog.filter(
    (e) => (e.status === 'failure' || e.status === 'failed') && new Date(e.timestamp) >= sevenDaysAgo
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
      articles: updatedThisWeek.map((e) => ({ title: e.title || `Article #${e.articleId}`, changesSummary: e.summary || e.detail })),
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
        detail: e.detail || e.error,
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
