import { NextResponse } from 'next/server';
import { readState, readLog, readArticles } from '@/lib/pipeline-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [state, log, articles] = await Promise.all([
    readState(),
    readLog(),
    readArticles(),
  ]);

  // Last 10 log entries (most recent first)
  const recentLog = [...log].reverse().slice(0, 10);

  // Upcoming scheduled articles
  const now = new Date();
  const scheduled = articles
    .filter((a) => a.status === 'scheduled' && a.publishAt)
    .sort((a, b) => new Date(a.publishAt!).getTime() - new Date(b.publishAt!).getTime())
    .map((a) => ({
      id: a.id,
      title: a.title,
      publishAt: a.publishAt,
      minutesUntil: Math.round((new Date(a.publishAt!).getTime() - now.getTime()) / 60000),
    }));

  return NextResponse.json({
    state,
    recentLog,
    scheduledArticles: scheduled,
  });
}
