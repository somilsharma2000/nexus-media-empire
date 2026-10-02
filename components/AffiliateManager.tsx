'use client';

import { useEffect, useState } from 'react';

interface AffiliateLink {
  id: string;
  name: string;
  slug: string;
  affiliateUrl: string;
  niche: string;
  commissionEstimate: string;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: '',
  affiliateUrl: '',
  niche: 'general',
  commissionEstimate: '',
};

export default function AffiliateManager() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [clicks, setClicks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function loadData() {
    try {
      const [linksRes, clicksRes] = await Promise.all([
        fetch('/api/affiliates'),
        fetch('/api/affiliates/clicks'),
      ]);
      if (linksRes.ok) setLinks(await linksRes.json());
      if (clicksRes.ok) setClicks(await clicksRes.json());
    } catch (err) {
      console.error('AffiliateManager load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleActive(link: AffiliateLink) {
    await fetch('/api/affiliates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: link.id, isActive: !link.isActive }),
    });
    await loadData();
  }

  async function deleteLink(id: string) {
    if (!confirm('Delete this affiliate link?')) return;
    await fetch('/api/affiliates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadData();
  }

  async function addLink() {
    if (!form.name || !form.affiliateUrl) return;
    setSaving(true);
    try {
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowAddModal(false);
      setForm(EMPTY_FORM);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  function copyLink(slug: string) {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/go/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">🔗 Affiliate Manager</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
        >
          + Add Link
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading affiliate links…</p>
      ) : links.length === 0 ? (
        <p className="text-gray-500 text-sm">No affiliate links yet. Add one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700 text-xs uppercase">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Niche</th>
                <th className="pb-2 pr-4">Commission</th>
                <th className="pb-2 pr-4">Clicks Today</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Shareable Link</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 pr-4 font-medium">{link.name}</td>
                  <td className="py-2 pr-4 capitalize text-gray-400">{link.niche}</td>
                  <td className="py-2 pr-4 text-green-400">{link.commissionEstimate}</td>
                  <td className="py-2 pr-4 text-center">{clicks[link.slug] ?? 0}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => toggleActive(link)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                        link.isActive
                          ? 'bg-green-800 text-green-300 hover:bg-red-800 hover:text-red-300'
                          : 'bg-gray-700 text-gray-400 hover:bg-green-800 hover:text-green-300'
                      }`}
                    >
                      {link.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-indigo-400 text-xs font-mono">
                      {siteOrigin}/go/{link.slug}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => copyLink(link.slug)}
                      className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded transition"
                    >
                      {copiedSlug === link.slug ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="px-2 py-1 bg-red-900 hover:bg-red-700 text-red-300 text-xs rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4">Add Affiliate Link</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ledger Hardware Wallet"
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Affiliate URL *</label>
                <input
                  value={form.affiliateUrl}
                  onChange={(e) => setForm((f) => ({ ...f, affiliateUrl: e.target.value }))}
                  placeholder="https://partner.example.com?ref=you"
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Niche</label>
                <input
                  value={form.niche}
                  onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
                  placeholder="crypto / finance / general"
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Commission Estimate</label>
                <input
                  value={form.commissionEstimate}
                  onChange={(e) => setForm((f) => ({ ...f, commissionEstimate: e.target.value }))}
                  placeholder="$10 per signup"
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={addLink}
                disabled={saving || !form.name || !form.affiliateUrl}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition"
              >
                {saving ? 'Saving…' : 'Add Link'}
              </button>
              <button
                onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); }}
                className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-400 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
