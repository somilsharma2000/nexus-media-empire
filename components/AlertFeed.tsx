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

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">🔔 System Alerts</h2>
        <button
          onClick={runHealthCheck}
          disabled={runningCheck}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
        >
          {runningCheck ? 'Checking…' : 'Run Health Check Now'}
        </button>
      </div>

      {lastCheck && (
        <p className="text-gray-400 text-xs mb-3">{lastCheck}</p>
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
