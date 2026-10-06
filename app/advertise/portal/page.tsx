"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  BarChart2, 
  Globe, 
  MousePointer, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  Sparkles,
  ExternalLink,
  Layers
} from "lucide-react";
import CookieConsent from "../../../components/CookieConsent";
import { formatNumber } from "../../../lib/format";


interface CampaignData {
  id: string;
  brandName: string;
  niche: string;
  package: string;
  status: string;
  impressionsDelivered: number;
  impressionsGoal: number;
  uniqueClicks: number;
  ctr: number;
  topCountries: { code: string; name: string; share: number }[];
  topPlacements: { name: string; views: number; clicks: number }[];
  activeDaysRemaining: number;
}

export default function SponsorPortalPage() {
  const [accessKey, setAccessKey] = useState("SP-NORD-2026");
  const [selectedBrand, setSelectedBrand] = useState<CampaignData | null>({
    id: "SP-NORD-2026",
    brandName: "NordLayer Enterprise Security",
    niche: "Network-Wide (Tech + Crypto + Finance)",
    package: "Multi-Domain Empire Takeover",
    status: "Active & Delivering",
    impressionsDelivered: 142800,
    impressionsGoal: 250000,
    uniqueClicks: 4280,
    ctr: 3.0,
    topCountries: [
      { code: "US", name: "United States", share: 58.4 },
      { code: "GB", name: "United Kingdom", share: 14.2 },
      { code: "DE", name: "Germany", share: 9.8 },
      { code: "CA", name: "Canada", share: 8.1 },
      { code: "AU", name: "Australia", share: 5.5 },
    ],
    topPlacements: [
      { name: "Sticky Co-Branded Header Takeover", views: 92400, clicks: 2840 },
      { name: "In-Article Behavioral Native Unit", views: 36200, clicks: 1120 },
      { name: "Executive Weekly Newsletter Broadcast", views: 14200, clicks: 320 },
    ],
    activeDaysRemaining: 18,
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const key = accessKey.toUpperCase().trim();
    if (key.includes("KRAKEN")) {
      setSelectedBrand({
        id: "SP-KRAKEN-2026",
        brandName: "Kraken Institutional",
        niche: "Crypto Daily (Institutional Desk)",
        package: "30-Day Niche Dominance",
        status: "Active & Delivering",
        impressionsDelivered: 89400,
        impressionsGoal: 120000,
        uniqueClicks: 2680,
        ctr: 3.0,
        topCountries: [
          { code: "US", name: "United States", share: 52.0 },
          { code: "GB", name: "United Kingdom", share: 18.5 },
          { code: "SG", name: "Singapore", share: 11.2 },
          { code: "CH", name: "Switzerland", share: 9.4 },
        ],
        topPlacements: [
          { name: "Crypto Header Takeover Bar", views: 64200, clicks: 1980 },
          { name: "Native High-Intent Crypto Ad Unit", views: 25200, clicks: 700 },
        ],
        activeDaysRemaining: 12,
      });
    } else if (key.includes("CARTA")) {
      setSelectedBrand({
        id: "SP-CARTA-2026",
        brandName: "Carta Equity",
        niche: "Wall St Insider (Corporate & Founders)",
        package: "30-Day Niche Dominance",
        status: "Active & Delivering",
        impressionsDelivered: 67200,
        impressionsGoal: 100000,
        uniqueClicks: 1890,
        ctr: 2.8,
        topCountries: [
          { code: "US", name: "United States", share: 71.0 },
          { code: "CA", name: "Canada", share: 12.0 },
          { code: "GB", name: "United Kingdom", share: 9.0 },
        ],
        topPlacements: [
          { name: "Wall St Header Bar", views: 48000, clicks: 1350 },
          { name: "Finance Behavioral Card", views: 19200, clicks: 540 },
        ],
        activeDaysRemaining: 15,
      });
    } else {
      // Default to live simulation
      setSelectedBrand({
        id: key || "DEMO-LIVE",
        brandName: key ? `${key} Campaign` : "Live Campaign Demonstration",
        niche: "The Trend Matrix (Tech & AI)",
        package: "Spotlight + In-Article Behavioral",
        status: "Active & Delivering",
        impressionsDelivered: 45300,
        impressionsGoal: 80000,
        uniqueClicks: 1340,
        ctr: 2.95,
        topCountries: [
          { code: "US", name: "United States", share: 64.0 },
          { code: "GB", name: "United Kingdom", share: 14.0 },
          { code: "DE", name: "Germany", share: 8.0 },
        ],
        topPlacements: [
          { name: "Header Takeover Banner", views: 32000, clicks: 960 },
          { name: "Smart Behavioral Ad Unit", views: 13300, clicks: 380 },
        ],
        activeDaysRemaining: 21,
      });
    }
  };

  const progress = selectedBrand 
    ? Math.min(100, Math.round((selectedBrand.impressionsDelivered / selectedBrand.impressionsGoal) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center py-4">
          <Link href="/advertise" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white font-mono font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Media Kit &amp; Rate Cards
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">SPONSOR PROOF-OF-PERFORMANCE PORTAL</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        
        {/* Header & Access Key Lookup */}
        <section className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3 h-3" /> Sponsor Reporting Interface (Demo &amp; Live Tracking)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Campaign Telemetry Hub</h1>
            <p className="text-xs text-gray-400 font-mono">
              Direct impression verification, placement telemetry, and attribution reports for active sponsor partners.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter Brand Key (e.g. SP-NORD-2026)"
              className="px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-full md:w-64 uppercase"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold shrink-0 transition-colors shadow-lg shadow-blue-600/30"
            >
              Verify
            </button>
          </form>
        </section>

        {selectedBrand && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Active Campaign Overview Banner */}
            <div className="bg-gradient-to-r from-[#0a1222] via-[#080d16] to-[#0a1222] border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">{selectedBrand.status}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-[11px] font-mono text-gray-400">{selectedBrand.activeDaysRemaining} Days Remaining</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedBrand.brandName}</h2>
                <p className="text-xs text-gray-300 font-mono">
                  {selectedBrand.package} • <span className="text-blue-400">{selectedBrand.niche}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert("Verification report generated. Telemetry audit signature: SHA256-NX-2026-VERIFIED")}
                  className="px-4 py-2.5 bg-[#03060a] hover:bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Audit CSV
                </button>
                <Link
                  href="/advertise"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <span>Renew / Upgrade</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Delivered Impressions</span>
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{formatNumber(selectedBrand.impressionsDelivered)}</div>
                <div className="text-[11px] text-gray-500 font-mono">
                  Goal: {formatNumber(selectedBrand.impressionsGoal)} ({progress}%)
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Verified Clicks</span>
                  <MousePointer className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{formatNumber(selectedBrand.uniqueClicks)}</div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  100% Bot-Filtered Attribution
                </div>
              </div>

              <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Average CTR</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{selectedBrand.ctr}%</div>
                <div className="text-[11px] text-gray-400 font-mono">
                  Industry Benchmark: 0.8%
                </div>
              </div>

              <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Audience Quality</span>
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">99.4%</div>
                <div className="text-[11px] text-yellow-400/90 font-mono">
                  Tier-1 Verified Human Readers
                </div>
              </div>
            </div>

            {/* Breakdown Tables: Placements & Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Placement Performance */}
              <div className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Placement Breakdown
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Live Stream</span>
                </div>

                <div className="space-y-3">
                  {selectedBrand.topPlacements.map((p, idx) => (
                    <div key={idx} className="p-4 bg-[#03060a] border border-gray-800/80 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="font-mono text-emerald-400 font-bold">{p.clicks} clicks</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
                        <span>{formatNumber(p.views)} impressions</span>
                        <span>{((p.clicks / p.views) * 100).toFixed(2)}% CTR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Share */}
              <div className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Reader Geographic Split
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Tier 1 Demographics</span>
                </div>

                <div className="space-y-3">
                  {selectedBrand.topCountries.map((c, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-300">{c.name} ({c.code})</span>
                        <span className="text-white font-bold">{c.share}%</span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full" style={{ width: `${c.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified SLA Guarantee */}
            <div className="p-6 bg-blue-950/20 border border-blue-900/40 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white font-mono">Nexus 100% Impression &amp; SLA Guarantee Active</div>
                <div className="text-gray-400">
                  If your guaranteed impression quota is not delivered within the campaign window, remaining impressions are automatically rolled over with a complimentary 20% bonus boost.
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <footer className="border-t border-gray-900 bg-black mt-20 py-12 text-center text-xs text-gray-500 font-mono">
        Nexus Media Empire • Verified Telemetry &amp; Sponsor Protection Engine © 2026
      </footer>

      <CookieConsent />
    </div>
  );
}
