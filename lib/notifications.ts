import { sendTelegramAlert } from './telegram';
import { resilientReadJson, atomicWriteJson } from './atomic-storage';
import path from 'path';

export interface SystemIncidentAlert {
  id?: string;
  source: 'pipeline' | 'payments' | 'uptime' | 'ai_engine' | 'security' | 'ad_slot' | 'crm';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

const ALERTS_PATH = path.join(process.cwd(), 'data', 'alerts.json');

/**
 * Universal Omnichannel Emergency & Incident Dispatcher
 * Sends instant notifications to Telegram, Discord/Slack Webhook, and saves to persistent alerts feed.
 */
export async function dispatchSystemAlert(alert: SystemIncidentAlert): Promise<{ success: boolean; dispatchedTo: string[] }> {
  const alertId = alert.id || `alt_${Date.now()}`;
  const timestamp = alert.timestamp || new Date().toISOString();
  const dispatchedTo: string[] = [];

  const formattedAlert = {
    id: alertId,
    type: alert.source,
    message: `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`,
    severity: alert.severity,
    metadata: alert.metadata || {},
    resolved: false,
    createdAt: timestamp,
  };

  // 1. Log to Persistent Database (data/alerts.json)
  try {
    const existing = await resilientReadJson<any[]>(ALERTS_PATH, []);
    const updated = [formattedAlert, ...existing].slice(0, 100);
    await atomicWriteJson(ALERTS_PATH, updated);
    dispatchedTo.push('database_feed');
  } catch (err) {
    console.error('[ALERT DISPATCH] Failed to write to data/alerts.json:', err);
  }

  // 2. Format Message for External Channels
  const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
  const plainText = `${emoji} <b>NEXUS EMPIRE ALERT: ${alert.title}</b>\n\n` +
    `• <b>System:</b> <code>${alert.source}</code>\n` +
    `• <b>Severity:</b> <b>${alert.severity.toUpperCase()}</b>\n` +
    `• <b>Details:</b> ${alert.message}\n` +
    `• <b>Time:</b> ${new Date(timestamp).toLocaleTimeString()} UTC\n\n` +
    `👉 <a href="http://localhost:3002">Open Admin Command Center</a>`;

  // 3. Dispatch to Telegram Bot (Phone)
  try {
    await sendTelegramAlert(plainText);
    if (process.env.TELEGRAM_BOT_TOKEN) {
      dispatchedTo.push('telegram_bot');
    }
  } catch (err) {
    console.error('[ALERT DISPATCH] Telegram dispatch error:', err);
  }

  // 4. Dispatch to Discord / Slack Webhook
  const webhookUrl = process.env.ALERT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const discordPayload = {
        username: 'Nexus Incident Radar',
        avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop',
        embeds: [
          {
            title: `${emoji} ${alert.title}`,
            description: alert.message,
            color: alert.severity === 'critical' ? 15158332 : alert.severity === 'warning' ? 16705372 : 3447003,
            fields: [
              { name: 'System', value: alert.source, inline: true },
              { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
              { name: 'Timestamp', value: new Date(timestamp).toUTCString(), inline: false },
            ],
            footer: { text: 'Nexus Autonomous Media Empire • Incident Response' },
          },
        ],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });
      dispatchedTo.push('webhook');
    } catch (err) {
      console.error('[ALERT DISPATCH] Webhook dispatch error:', err);
    }
  }

  return { success: true, dispatchedTo };
}
