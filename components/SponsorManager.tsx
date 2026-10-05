"use client";

import React, { useState, useEffect } from "react";
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  ExternalLink, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Layers, 
  Eye, 
  RefreshCw,
  Edit2
} from "lucide-react";

interface SponsorInquiry {
  id: string;
  companyName: string;
  contactEmail: string;
  budgetMonthly: string;
  targetNiche: string;
  placementRequested: string;
  notes: string;
  status: "new" | "contacted" | "approved" | "declined";
  createdAt: string;
}

interface Sponsor {
  id: string;
  brandName: string;
  headline: string;
  ctaText: string;
  ctaUrl: string;
  placement: string;
  niche: string;
  cpm: number;
  impressionsDelivered: number;
  active: boolean;
  tier: string;
}

export default function SponsorManager() {
  const [inquiries, setInquiries] = useState<SponsorInquiry[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  const [formSponsor, setFormSponsor] = useState({
    brandName: "",
    headline: "",
    ctaText: "Explore Now →",
    ctaUrl: "https://",
    placement: "header_takeover",
    niche: "all",
    cpm: 45,
    tier: "niche_exclusive",
    active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resInq, resSp] = await Promise.all([
        fetch("/api/sponsor/inquire"),
        fetch("/api/sponsors"),
      ]);
      const dataInq = await resInq.json();
      const dataSp = await resSp.json();
      setInquiries(dataInq || []);
      setSponsors(dataSp || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/sponsor/inquire", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Delete this sponsor inquiry?")) return;
    try {
      await fetch(`/api/sponsor/inquire?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSponsorActive = async (sponsor: Sponsor) => {
    try {
      await fetch("/api/sponsors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sponsor.id, active: !sponsor.active }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm("Remove this brand sponsor?")) return;
    try {
      await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSponsor) {
        await fetch("/api/sponsors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formSponsor, id: editingSponsor.id }),
        });
      } else {
        await fetch("/api/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formSponsor),
        });
      }
      setShowAddModal(false);
      setEditingSponsor(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#080d16] p-6 rounded-3xl border border-gray-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase bg-blue-950 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-800">
              High-Ticket Monetization
            </span>
            <span className="text-xs text-gray-500 font-mono">• Direct B2B Revenue</span>
          </div>
          <h2 className="text-2xl font-black text-white">Brand Sponsorships &amp; RFPs</h2>
          <p className="text-xs text-gray-400">
            Manage high-CPM brand takeovers, incoming RFPs from /advertise, and category exclusivity locks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-[#03060a] hover:bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-mono transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="/advertise"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#03060a] hover:bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>Live Media Kit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              setEditingSponsor(null);
              setFormSponsor({
                brandName: "",
                headline: "",
                ctaText: "Explore Now →",
                ctaUrl: "https://",
                placement: "header_takeover",
                niche: "all",
                cpm: 45,
                tier: "niche_exclusive",
                active: true,
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Sponsor</span>
          </button>
        </div>
      </div>

      {/* ACTIVE SPONSORS & TAKEOVERS */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" /> Active Brand Takeover Campaigns ({sponsors.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsors.map((s) => (
            <div
              key={s.id}
              className={`p-6 rounded-2xl border transition-all ${
                s.active ? "bg-[#080d16] border-blue-900/60 shadow-xl" : "bg-[#05080e] border-gray-900 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80 font-bold">
                  {s.niche.toUpperCase()} NICHE
                </span>
                <button
                  onClick={() => handleToggleSponsorActive(s)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold transition-colors ${
                    s.active ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {s.active ? "LIVE TAKEOVER" : "PAUSED"}
                </button>
              </div>

              <h4 className="text-lg font-bold text-white mb-1">{s.brandName}</h4>
              <p className="text-xs text-gray-400 line-clamp-2 mb-4">{s.headline}</p>

              <div className="pt-3 border-t border-gray-800/80 flex justify-between items-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">CPM Rate</div>
                  <div className="text-emerald-400 font-bold">${s.cpm} / 1k imp</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase">Impressions</div>
                  <div className="text-gray-300 font-bold">{s.impressionsDelivered.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingSponsor(s);
                    setFormSponsor({
                      brandName: s.brandName,
                      headline: s.headline,
                      ctaText: s.ctaText,
                      ctaUrl: s.ctaUrl,
                      placement: s.placement,
                      niche: s.niche,
                      cpm: s.cpm,
                      tier: s.tier,
                      active: s.active,
                    });
                    setShowAddModal(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  title="Edit Sponsor"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteSponsor(s.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INCOMING SPONSORSHIP RFPs & INQUIRIES */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" /> Direct Sponsor Booking RFPs ({inquiries.length})
          </h3>
          <span className="text-xs text-gray-500 font-mono">Instant push alerts sent to Telegram</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-[#080d16] border border-gray-800/80 p-8 rounded-3xl text-center space-y-2">
            <p className="text-sm text-gray-400">No sponsorship inquiries yet.</p>
            <p className="text-xs text-gray-600 font-mono">Inquiries submitted on /advertise will appear here instantly.</p>
          </div>
        ) : (
          <div className="bg-[#080d16] border border-gray-800/80 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#03060a] text-gray-400 border-b border-gray-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Brand / Company</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Requested Package</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div>{inq.companyName}</div>
                        <div className="text-[10px] text-gray-500 font-normal">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        <a href={`mailto:${inq.contactEmail}`} className="text-blue-400 hover:underline">
                          {inq.contactEmail}
                        </a>
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-bold">{inq.budgetMonthly}</td>
                      <td className="py-4 px-4 text-gray-400">
                        <div>{inq.placementRequested}</div>
                        <div className="text-[10px] text-gray-500">Niche: {inq.targetNiche}</div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={inq.status || "new"}
                          onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                          className="px-2.5 py-1 bg-[#03060a] border border-gray-800 rounded-lg text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="new">🆕 New RFP</option>
                          <option value="contacted">📩 Contacted</option>
                          <option value="approved">✅ Approved &amp; Booked</option>
                          <option value="declined">❌ Closed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/30"
                          title="Delete RFP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* CREATE / EDIT SPONSOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#080d16] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold text-white">
              {editingSponsor ? "Edit Sponsor Campaign" : "Add New Brand Sponsor"}
            </h3>

            <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 uppercase mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={formSponsor.brandName}
                  onChange={(e) => setFormSponsor({ ...formSponsor, brandName: e.target.value })}
                  placeholder="e.g. Ledger / Supabase / Kraken"
                  className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Headline / Pitch Copy</label>
                <input
                  type="text"
                  required
                  value={formSponsor.headline}
                  onChange={(e) => setFormSponsor({ ...formSponsor, headline: e.target.value })}
                  placeholder="e.g. Zero-Trust Cloud Network Security for Remote Teams"
                  className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={formSponsor.ctaText}
                    onChange={(e) => setFormSponsor({ ...formSponsor, ctaText: e.target.value })}
                    placeholder="Deploy Now →"
                    className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Target Niche</label>
                  <select
                    value={formSponsor.niche}
                    onChange={(e) => setFormSponsor({ ...formSponsor, niche: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Empire Sites</option>
                    <option value="news">Tech &amp; AI (The Trend Matrix)</option>
                    <option value="crypto">Crypto (Crypto Daily)</option>
                    <option value="finance">Finance (Wall St Insider)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Destination URL</label>
                <input
                  type="url"
                  required
                  value={formSponsor.ctaUrl}
                  onChange={(e) => setFormSponsor({ ...formSponsor, ctaUrl: e.target.value })}
                  placeholder="https://sponsor.com/landing-page"
                  className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Agreed CPM ($)</label>
                  <input
                    type="number"
                    value={formSponsor.cpm}
                    onChange={(e) => setFormSponsor({ ...formSponsor, cpm: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Tier / Exclusivity</label>
                  <select
                    value={formSponsor.tier}
                    onChange={(e) => setFormSponsor({ ...formSponsor, tier: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="niche_exclusive">Niche Exclusive (100% SOV)</option>
                    <option value="enterprise_partner">Empire Network Partner</option>
                    <option value="newsletter_spotlight">Newsletter Spotlight</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#03060a] hover:bg-gray-900 text-gray-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Save &amp; Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
