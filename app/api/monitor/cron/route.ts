import { NextResponse } from 'next/server';
import { sendTelegramAlert } from '@/lib/telegram';
import { getCanonicalSiteUrl } from '@/lib/site-url';
import { addAlert } from '@/lib/data-layer';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const isVercelCron = Boolean(request.headers.get('x-vercel-cron'));
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`;

  if (!isVercelCron && authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = getCanonicalSiteUrl();
  const checks = [
    { url: `${base}/news`,         label: 'News frontend is down',    type: 'site_down',    severity: 'critical' },
    { url: `${base}/crypto`,       label: 'Crypto frontend is down',  type: 'site_down',    severity: 'critical' },
    { url: `${base}/finance`,      label: 'Finance frontend is down', type: 'site_down',    severity: 'critical' },
    { url: `${base}/api/articles`, label: 'Articles API empty',       type: 'article_zero', severity: 'warning'  },
    { url: `${base}/ads.txt`,      label: 'ads.txt not accessible',   type: 'ads_txt_fail', severity: 'warning'  },
  ];

  const newAlerts: any[] = [];

  // Database connectivity check
  const db = getPrisma();
  if (db) {
    try {
      await db.$queryRaw`SELECT 1`;
    } catch (dbErr: any) {
      const dbAlert = await addAlert({
        type: 'db_fail',
        message: `Database health check failed: ${dbErr.message}`,
        severity: 'critical',
      });
      newAlerts.push(dbAlert);
      await sendTelegramAlert(
        `🚨 <b>CRITICAL DATABASE FAILURE</b>\n` +
        `Unable to reach PostgreSQL database.\n` +
        `Error: ${dbErr.message}\n` +
        `Time: ${new Date().toUTCString()}`
      );
    }
  }

  for (const check of checks) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(check.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);

      if (check.type === 'article_zero') {
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length === 0) {
            const created = await addAlert({ type: check.type, message: check.label, severity: check.severity });
            newAlerts.push(created);
          }
        } else {
          const created = await addAlert({ type: 'site_down', message: 'Articles API is down', severity: 'critical' });
          newAlerts.push(created);
        }
      } else {
        if (res.status !== 200) {
          const created = await addAlert({ type: check.type, message: check.label, severity: check.severity });
          newAlerts.push(created);
        }
      }
    } catch {
      const created = await addAlert({ type: check.type, message: `${check.label} (connection refused)`, severity: check.severity });
      newAlerts.push(created);
    }
  }

  return NextResponse.json({
    checked: checks.length + 1,
    alerts: newAlerts.length,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return POST(request);
}
