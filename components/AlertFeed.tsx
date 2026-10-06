'use client';

import { useEffect, useState, useCallback } from 'react';

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityBadge: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  warning:  'bg-yellow-500 text-black',
  info:     'bg-blue-500 text-white',
};

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/monitor/alerts');
      if (!res.ok) return;
      const data: Alert[] = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  async function resolveAlert(id: string) {
    await fetch('/api/monitor/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchAlerts();
  }

  async function runHealthCheck() {
    setRunningCheck(true);
    try {
      const res = await fetch('/api/monitor/cron', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}` },
      });
      const data = await res.json();
      setLastCheck(`Checked ${data.checked} targets, ${data.alerts} new alerts`);
      await fetchAlerts();
    } catch {
      setLastCheck('Health check failed — see console');
    } finally {
      setRunningCheck(false);
    }
  }

  const [testSending, setTestSending] = useState(false);

  async function sendTestAlert() {
    setTestSending(true);
    try {
      const res = await fetch('/api/monitor/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'pipeline',
          severity: 'warning',
          title: 'Emergency Notification Test',
          message: 'All system listeners (Telegram Bot, Discord Webhook, In-App Incident Radar) are operational and responsive.',
        }),
      });
      const data = await res.json();
      setLastCheck(`✅ Test alert broadcasted to: ${data.dispatchedTo?.join(', ') || 'channels'}`);
      await fetchAlerts();
    } catch {
      setLastCheck('❌ Failed to dispatch test alert');
    } finally {
      setTestSending(false);
    }
  }

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white font-black text-xl tracking-tight">🚨 Emergency Alert &amp; Incident Radar</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Live Active
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">Instant mobile &amp; webhook alerts for pipeline errors, uptime drops, and payment events.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={sendTestAlert}
            disabled={testSending}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
          >
            {testSending ? 'Broadcasting...' : '⚡ Test Phone Alert'}
          </button>
          <button
            onClick={runHealthCheck}
            disabled={runningCheck}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {runningCheck ? 'Checking…' : 'Run Health Check'}
          </button>
        </div>
      </div>

      {lastCheck && (
        <div className="bg-[#060b13] border border-blue-500/30 text-blue-300 text-xs font-mono p-3 rounded-xl mb-4">
          {lastCheck}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading alerts…</p>
      ) : unresolvedAlerts.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <span className="text-4xl">✅</span>
          <p className="text-green-400 font-semibold">All systems operational</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {unresolvedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between bg-gray-800 rounded-lg p-3 gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`shrink-0 inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${severityBadge[alert.severity] ?? 'bg-gray-600 text-white'}`}
                >
                  {alert.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-gray-300 text-sm font-medium truncate">{alert.type}</p>
                  <p className="text-gray-500 text-xs">{alert.message}</p>
                  <p className="text-gray-600 text-xs mt-1">{timeAgo(alert.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => resolveAlert(alert.id)}
                className="shrink-0 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-2 py-1 rounded transition"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
