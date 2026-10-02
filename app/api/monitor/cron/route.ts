import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendTelegramAlert } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const alertsFilePath = path.join(process.cwd(), 'data', 'alerts.json');

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
  createdAt: string;
}

async function readAlerts(): Promise<Alert[]> {
  try {
    await fs.mkdir(path.dirname(alertsFilePath), { recursive: true });
    const data = await fs.readFile(alertsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeAlerts(alerts: Alert[]): Promise<void> {
  await fs.writeFile(alertsFilePath, JSON.stringify(alerts, null, 2));
}

async function createAlert(alert: Omit<Alert, 'id' | 'resolved' | 'createdAt'>): Promise<Alert> {
  const newAlert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    resolved: false,
    createdAt: new Date().toISOString(),
    ...alert,
  };

  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
    } catch (err) {
      console.error('[Monitor] Failed to send webhook:', err);
    }
  } else {
    console.log('[Monitor Alert]', newAlert);
  }

  // Send Telegram alert for critical severity issues
  if (newAlert.severity === 'critical') {
    await sendTelegramAlert(
      `🚨 <b>CRITICAL ALERT</b>\n` +
      `${newAlert.message}\n` +
      `Type: ${newAlert.type}\n` +
      `Time: ${new Date(newAlert.createdAt).toUTCString()}`
    );
  }

  return newAlert;
}


export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = 'http://localhost:3002';
  const checks = [
    { url: `${base}/news`,         label: 'News frontend is down',    type: 'site_down',    severity: 'critical' },
    { url: `${base}/crypto`,       label: 'Crypto frontend is down',  type: 'site_down',    severity: 'critical' },
    { url: `${base}/finance`,      label: 'Finance frontend is down', type: 'site_down',    severity: 'critical' },
    { url: `${base}/api/articles`, label: 'Articles API empty',       type: 'article_zero', severity: 'warning'  },
    { url: `${base}/ads.txt`,      label: 'ads.txt not accessible',   type: 'ads_txt_fail', severity: 'warning'  },
  ];

  const newAlerts: Alert[] = [];

  for (const check of checks) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(check.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);

      if (check.type === 'article_zero') {
        // Special check — parse body
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length === 0) {
            newAlerts.push(await createAlert({ type: check.type, message: check.label, severity: check.severity }));
          }
        } else {
          newAlerts.push(await createAlert({ type: 'site_down', message: 'Articles API is down', severity: 'critical' }));
        }
      } else {
        if (res.status !== 200) {
          newAlerts.push(await createAlert({ type: check.type, message: check.label, severity: check.severity }));
        }
      }
    } catch {
      newAlerts.push(await createAlert({ type: check.type, message: `${check.label} (connection refused)`, severity: check.severity }));
    }
  }

  // Persist new alerts
  if (newAlerts.length > 0) {
    const existing = await readAlerts();
    await writeAlerts([...newAlerts, ...existing]);
  }

  return NextResponse.json({
    checked: checks.length,
    alerts: newAlerts.length,
    timestamp: new Date().toISOString(),
  });
}
