"use client";

import React, { useEffect, useState } from "react";
import { 
  Link2, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  X, 
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

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
  name: "",
  affiliateUrl: "",
  niche: "crypto",
  commissionEstimate: "$25 CPA",
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
      setLoading(true);
      const [linksRes, clicksRes] = await Promise.all([
        fetch("/api/affiliates"),
        fetch("/api/affiliates/clicks"),
      ]);
      if (linksRes.ok) setLinks(await linksRes.json());
      if (clicksRes.ok) setClicks(await clicksRes.json());
    } catch (err) {
      console.error("AffiliateManager load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleActive(link: AffiliateLink) {
    const updated = { ...link, isActive: !link.isActive };
    await fetch("/api/affiliates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setLinks(links.map(l => l.id === link.id ? updated : l));
  }

  async function deleteLink(id: string) {
    if (!confirm("Are you sure you want to remove this affiliate link?")) return;
    await fetch(`/api/affiliates?id=${id}`, { method: "DELETE" });
    setLinks(links.filter(l => l.id !== id));
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm(EMPTY_FORM);
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  function copyLink(slug: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/go/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-900/40 border border-gray-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Affiliate Cloaker & Bounties</h3>
            <p className="text-xs text-gray-500 font-mono">Dynamic /go/[slug] redirectors with automated click logging</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4" /> Add Affiliate Link
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-2xl text-gray-500 text-xs">
          No affiliate links registered. Click &quot;Add Affiliate Link&quot; to create your first cloaked URL.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                <th className="px-5 py-3.5 text-left">Partner Program</th>
                <th className="px-5 py-3.5 text-left">Niche</th>
                <th className="px-5 py-3.5 text-left">Estimated Commission</th>
                <th className="px-5 py-3.5 text-center">Clicks Today</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-left">Cloaked Redirect URL</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-white">{link.name}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase font-mono text-[10px]">
                      {link.niche}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-emerald-400 font-mono font-bold">{link.commissionEstimate}</td>
                  <td className="px-5 py-4 text-center font-mono font-bold text-white">
                    {clicks[link.slug] ?? 0}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleActive(link)}
                      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-all focus:outline-none ${
                        link.isActive ? "bg-emerald-600 shadow-md shadow-emerald-950" : "bg-gray-800"
                      }`}
                    >
                      <span
                        className={`inline-block w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          link.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-blue-400 font-mono text-[11px] bg-blue-950/30 px-2.5 py-1 rounded-lg border border-blue-900/40">
                      {siteOrigin}/go/{link.slug}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => copyLink(link.slug)}
                        className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 font-bold transition-all flex items-center gap-1"
                      >
                        {copiedSlug === link.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/40 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                Add Affiliate Link
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Partner / Brand Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ledger Hardware Wallet"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Destination Affiliate URL *</label>
                <input
                  required
                  type="url"
                  value={form.affiliateUrl}
                  onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                  placeholder="https://partner.ledger.com/..."
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Target Niche</label>
                  <select
                    value={form.niche}
                    onChange={(e) => setForm({ ...form, niche: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none uppercase"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="finance">Finance</option>
                    <option value="news">Tech & AI</option>
                    <option value="saas">SaaS</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Commission Estimate</label>
                  <input
                    type="text"
                    value={form.commissionEstimate}
                    onChange={(e) => setForm({ ...form, commissionEstimate: e.target.value })}
                    placeholder="e.g. $30 CPA or 30% recurring"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
