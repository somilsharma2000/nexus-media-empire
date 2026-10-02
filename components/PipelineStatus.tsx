'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface StepState {
  status: 'active' | 'paused';
  consecutiveFailures: number;
  lastRun?: string;
}

interface PipelineState {
  [step: string]: StepState;
}

interface LogEntry {
  timestamp: string;
  step: string;
  status: 'success' | 'failure' | 'info';
  detail: string;
}

interface ScheduledArticle {
  id: number;
  title: string;
  publishAt: string;
  minutesUntil: number;
}

interface StatusData {
  state: PipelineState;
  recentLog: LogEntry[];
  scheduledArticles: ScheduledArticle[];
}

// ─── Config ─────────────────────────────────────────────────────────────────
const PIPELINE_STEPS: { key: string; label: string }[] = [
  { key: 'trend_scout', label: 'Trend Scout' },
  { key: 'qa_review',   label: 'QA Review'   },
  { key: 'publisher',   label: 'Publisher'   },
];

const STATUS_COLORS: Record<string, string> = {
  success: 'text-green-400',
  failure: 'text-red-400',
  info:    'text-blue-400',
};

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatusDot({ status }: { status: 'active' | 'paused' | 'warn' }) {
  const color =
    status === 'active' ? 'bg-green-500' :
    status === 'warn'   ? 'bg-yellow-500' :
    'bg-red-500';
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full mr-2 ${color} shadow-sm`}
      title={status}
    />
  );
}

function formatRelative(iso?: string): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatMinutes(mins: number): string {
  if (mins < 0) return 'Overdue';
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
  return `in ${Math.floor(hrs / 24)}d`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PipelineStatus() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cronSecret, setCronSecret] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleControl = async (step: string, action: 'pause' | 'resume') => {
    if (!cronSecret) {
      alert('Enter CRON_SECRET first to authenticate control actions.');
      return;
    }
    setActionLoading(`${step}-${action}`);
    try {
      const res = await fetch('/api/pipeline/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ step, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Control failed');
      await fetchStatus();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            ⚙️ Pipeline Status
          </h1>
          <div className="flex items-center gap-3">
            <input
              type="password"
              placeholder="CRON_SECRET for controls"
              value={cronSecret}
              onChange={(e) => setCronSecret(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchStatus}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded text-sm transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded p-3 text-red-300">
            Failed to load status: {error}
          </div>
        )}

        {loading && !data ? (
          <p className="text-gray-400 animate-pulse">Loading pipeline status…</p>
        ) : data ? (
          <>
            {/* Step Status Board */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Pipeline Steps</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PIPELINE_STEPS.map(({ key, label }) => {
                  const stepState = data.state[key];
                  const isActive = stepState?.status === 'active';
                  const failures = stepState?.consecutiveFailures ?? 0;
                  const dotStatus =
                    !isActive ? 'paused' :
                    failures > 0 ? 'warn' :
                    'active';

                  return (
                    <div
                      key={key}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <StatusDot status={dotStatus} />
                          <span className="font-bold text-lg">{label}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {stepState?.status ?? 'unknown'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 space-y-1">
                        <div>Last run: <span className="text-white">{formatRelative(stepState?.lastRun)}</span></div>
                        <div>
                          Consecutive failures:{' '}
                          <span className={failures >= 3 ? 'text-red-400' : failures > 0 ? 'text-yellow-400' : 'text-green-400'}>
                            {failures}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isActive ? (
                          <button
                            onClick={() => handleControl(key, 'pause')}
                            disabled={actionLoading === `${key}-pause`}
                            className="flex-1 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 py-1.5 rounded text-sm transition-colors"
                          >
                            {actionLoading === `${key}-pause` ? '…' : '⏸ Pause'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleControl(key, 'resume')}
                            disabled={actionLoading === `${key}-resume`}
                            className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 py-1.5 rounded text-sm transition-colors"
                          >
                            {actionLoading === `${key}-resume` ? '…' : '▶ Resume'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Scheduled Articles */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">
                Upcoming Scheduled Articles ({data.scheduledArticles.length})
              </h2>
              {data.scheduledArticles.length === 0 ? (
                <p className="text-gray-500 text-sm">No articles currently scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {data.scheduledArticles.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gray-900 border border-gray-700 rounded px-4 py-3 flex justify-between items-center"
                    >
                      <span className="text-sm truncate max-w-[60%]">{a.title}</span>
                      <div className="text-right text-sm text-gray-400">
                        <div className="text-blue-400">{formatMinutes(a.minutesUntil)}</div>
                        <div className="text-xs">{new Date(a.publishAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pipeline Log */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Recent Log (last 10 events)</h2>
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                {data.recentLog.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4">No log entries yet.</p>
                ) : (
                  <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto">
                    {data.recentLog.map((entry, idx) => (
                      <div key={idx} className="px-4 py-2.5 flex gap-4 text-sm hover:bg-gray-800/50">
                        <span className="text-gray-500 whitespace-nowrap text-xs mt-0.5">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-gray-400 w-24 shrink-0">{entry.step}</span>
                        <span className={`w-16 shrink-0 ${STATUS_COLORS[entry.status] ?? 'text-gray-400'}`}>
                          {entry.status}
                        </span>
                        <span className="text-gray-300 truncate">{entry.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}

        <p className="text-gray-600 text-xs text-center">
          Auto-refreshes every 30 seconds · {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
