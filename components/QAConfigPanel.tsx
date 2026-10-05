'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/format';

interface QAConfig {
  approveThreshold: number;
  reviseThreshold: number;
  maxRevisionAttempts: number;
  autoPublishApproved: boolean;
  requireQAForPublish: boolean;
}

interface TokenUsage {
  month: string;
  tokensUsed: number;
  estimatedCost: number;
  budgetUsd: number;
  remainingUsd: number;
}

export default function QAConfigPanel() {
  const [config, setConfig] = useState<QAConfig>({
    approveThreshold: 8,
    reviseThreshold: 5,
    maxRevisionAttempts: 1,
    autoPublishApproved: true,
    requireQAForPublish: true,
  });
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/qa-review/config').then((r) => r.json()),
      fetch('/api/generate/usage').then((r) => r.json()),
    ])
      .then(([cfg, use]) => {
        setConfig(cfg as QAConfig);
        setUsage(use as TokenUsage);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSavedMsg('');
    try {
      const res = await fetch('/api/qa-review/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSavedMsg('Settings saved ✓');
        setTimeout(() => setSavedMsg(''), 3000);
      } else {
        setSavedMsg('Save failed ✗');
      }
    } catch {
      setSavedMsg('Network error ✗');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        Loading QA configuration…
      </div>
    );
  }

  const budgetPct = usage
    ? Math.min(100, (usage.estimatedCost / usage.budgetUsd) * 100)
    : 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6 max-w-xl">
      <h2 className="text-white text-xl font-bold">⚙️ AI QA Gate Configuration</h2>

      {/* ── Score Thresholds ── */}
      <div className="space-y-4">
        <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wider">
          Score Thresholds
        </h3>

        {/* Approve threshold */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-gray-300 text-sm">
              Approve threshold
            </label>
            <span className="text-green-400 font-mono text-sm">{config.approveThreshold}</span>
          </div>
          <input
            type="range"
            min={6}
            max={10}
            step={1}
            value={config.approveThreshold}
            onChange={(e) =>
              setConfig((c) => ({ ...c, approveThreshold: Number(e.target.value) }))
            }
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>6</span><span>10</span>
          </div>
        </div>

        {/* Revise threshold */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-gray-300 text-sm">
              Revise threshold
            </label>
            <span className="text-yellow-400 font-mono text-sm">{config.reviseThreshold}</span>
          </div>
          <input
            type="range"
            min={3}
            max={7}
            step={1}
            value={config.reviseThreshold}
            onChange={(e) =>
              setConfig((c) => ({ ...c, reviseThreshold: Number(e.target.value) }))
            }
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>3</span><span>7</span>
          </div>
        </div>
      </div>

      {/* ── Toggles ── */}
      <div className="space-y-3">
        <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wider">
          Behaviour
        </h3>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-300 text-sm">Auto-publish on APPROVE</span>
          <button
            type="button"
            onClick={() => setConfig((c) => ({ ...c, autoPublishApproved: !c.autoPublishApproved }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.autoPublishApproved ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.autoPublishApproved ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-300 text-sm">Require QA before publish</span>
          <button
            type="button"
            onClick={() => setConfig((c) => ({ ...c, requireQAForPublish: !c.requireQAForPublish }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.requireQAForPublish ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.requireQAForPublish ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* ── Token / Budget Usage ── */}
      {usage && (
        <div className="space-y-2">
          <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wider">
            Monthly AI Spend — {usage.month || 'No data yet'}
          </h3>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>${usage.estimatedCost.toFixed(4)} spent</span>
            <span>${usage.remainingUsd.toFixed(4)} remaining of ${usage.budgetUsd}</span>
          </div>
          <p className="text-xs text-gray-500">
            {formatNumber(usage.tokensUsed)} tokens used this month
          </p>
        </div>
      )}

      {/* ── Save button ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {savedMsg && (
          <span
            className={`text-sm ${savedMsg.includes('✓') ? 'text-green-400' : 'text-red-400'}`}
          >
            {savedMsg}
          </span>
        )}
      </div>
    </div>
  );
}
