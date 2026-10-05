'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/format';

interface Keyword {
  keyword: string;
  position: number;
  clicks: number;
  impressions: number;
  trend: 'up' | 'down' | 'flat';
}

interface ConfirmModal {
  keyword: string;
  open: boolean;
  loading: boolean;
  result: string | null;
}

export default function RisingKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ConfirmModal>({ keyword: '', open: false, loading: false, result: null });

  useEffect(() => {
    fetch('/api/seo/keywords')
      .then((r) => r.json())
      .then((data) => setKeywords(data.keywords ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openModal(keyword: string) {
    setModal({ keyword, open: true, loading: false, result: null });
  }

  function closeModal() {
    setModal({ keyword: '', open: false, loading: false, result: null });
  }

  async function writeArticle() {
    setModal((m) => ({ ...m, loading: true }));
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: modal.keyword }),
      });
      const data = await res.json();
      setModal((m) => ({
        ...m,
        loading: false,
        result: data.success ? '✅ Article generated and queued!' : `❌ Error: ${data.error}`,
      }));
    } catch {
      setModal((m) => ({ ...m, loading: false, result: '❌ Request failed' }));
    }
  }

  const trendIcon = (t: string) =>
    t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
  const trendColor = (t: string) =>
    t === 'up' ? 'text-green-400' : t === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      {/* Banner */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-white font-bold text-lg">📈 Rising Keywords</h2>
        <a
          href="#env-setup"
          className="text-xs bg-yellow-800 text-yellow-200 px-3 py-1 rounded-full hover:bg-yellow-700 transition"
          title="Add GOOGLE_SEARCH_CONSOLE_CREDENTIALS to .env.local"
        >
          Connect Search Console for live data →
        </a>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading keywords…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700 text-xs uppercase">
                <th className="pb-2 pr-4">Keyword</th>
                <th className="pb-2 pr-4">Pos.</th>
                <th className="pb-2 pr-4">Clicks</th>
                <th className="pb-2 pr-4">Impress.</th>
                <th className="pb-2 pr-4">Trend</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr key={kw.keyword} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 pr-4 font-medium">{kw.keyword}</td>
                  <td className="py-2 pr-4">{kw.position}</td>
                  <td className="py-2 pr-4">{kw.clicks}</td>
                  <td className="py-2 pr-4">{formatNumber(kw.impressions)}</td>
                  <td className={`py-2 pr-4 font-bold ${trendColor(kw.trend)}`}>
                    {trendIcon(kw.trend)}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => openModal(kw.keyword)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition"
                    >
                      Write Article →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Generate Article</h3>
            <p className="text-gray-400 text-sm mb-4">
              Generate an SEO-optimised article for:{' '}
              <span className="text-indigo-300 font-semibold">"{modal.keyword}"</span>?
            </p>
            {modal.result ? (
              <p className="text-sm mb-4">{modal.result}</p>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={writeArticle}
                  disabled={modal.loading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition"
                >
                  {modal.loading ? 'Generating…' : 'Confirm & Generate'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-400 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}
            {modal.result && (
              <button
                onClick={closeModal}
                className="mt-3 w-full py-2 border border-gray-600 text-gray-300 hover:border-gray-400 rounded-lg transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
