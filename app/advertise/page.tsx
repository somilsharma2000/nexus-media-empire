"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Building, 
  Mail, 
  BarChart, 
  Sparkles,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Calculator,
  Sliders,
  ExternalLink,
  Target,
  Award,
  Layers,
  FileText,
  MousePointerClick
} from "lucide-react";
import CookieConsent from "../../components/CookieConsent";
import { formatNumber } from "../../lib/format";

export default function AdvertisePage() {
  const [budgetSlider, setBudgetSlider] = useState<number>(2500);
  const [selectedNiche, setSelectedNiche] = useState<string>("all");

  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: "",
    budgetMonthly: "$2,500 - $5,000",
    targetNiche: "all",
    placementRequested: "30-Day Niche Subdomain Takeover ($1,499/mo)",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic ROI Calculations
  const cpmRate = selectedNiche === "crypto" ? 65 : selectedNiche === "finance" ? 55 : 45;
  const estimatedImpressions = Math.round((budgetSlider / cpmRate) * 1000);
  const estimatedClicks = Math.round(estimatedImpressions * 0.028); // 2.8% CTR
  const estimatedLeads = Math.max(1, Math.round(estimatedClicks * 0.065)); // 6.5% landing page conversion
  const googleAdsEquivalentCost = Math.round(estimatedClicks * 18.5); // $18.50 avg CPC for B2B/Finance keywords
  const savingsPercent = Math.round(((googleAdsEquivalentCost - budgetSlider) / googleAdsEquivalentCost) * 100);

  const selectPackage = (packageName: string, budgetRange: string, niche: string) => {
    setFormData((prev) => ({
      ...prev,
      placementRequested: packageName,
      budgetMonthly: budgetRange,
      targetNiche: niche,
    }));
    const el = document.getElementById("inquiry-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sponsor/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit inquiry");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* Top Navigation */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2.5 text-xs text-gray-400 hover:text-white font-semibold transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" /> Return to Network Hub
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/advertise/portal"
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Sponsor Live Telemetry Portal →
            </Link>
            <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded-full font-mono font-bold hidden sm:inline">
              OFFICIAL MEDIA KIT 2026
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Direct Advertising &amp; Brand Partnership Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Connect With High-Intent Founders, Tech Leaders &amp; Financial Operators
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Nexus Media Empire operates 3 focused digital publications across Artificial Intelligence, Web3 Protocols, and Institutional Finance. High viewability, zero ad-blocker penalty, and native programmatic integration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs">
            <a href="#packages" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2">
              <span>View Packages &amp; Specs</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#calculator" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-xl transition-all">
              Campaign Reach Estimator
            </a>
          </div>
        </section>

        {/* Network Metrics Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-black text-white font-mono">Growing</div>
            <div className="text-xs text-gray-400 font-mono">Target Audience</div>
            <div className="text-[10px] text-emerald-400 font-mono">US, UK &amp; Global Tier 1</div>
          </div>
          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-black text-blue-400 font-mono">3 Niches</div>
            <div className="text-xs text-gray-400 font-mono">Multi-Domain Network</div>
            <div className="text-[10px] text-blue-400/80 font-mono">Tech, Crypto &amp; Finance</div>
          </div>
          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-black text-purple-400 font-mono">High Intent</div>
            <div className="text-xs text-gray-400 font-mono">Audience Profile</div>
            <div className="text-[10px] text-purple-400/80 font-mono">Engineers &amp; Investors</div>
          </div>
          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-black text-emerald-400 font-mono">100% Native</div>
            <div className="text-xs text-gray-400 font-mono">Contextual Placements</div>
            <div className="text-[10px] text-emerald-400 font-mono">Ad-Block Resistant</div>
          </div>
        </section>

        {/* INTERACTIVE CAMPAIGN ROI & IMPRESSION CALCULATOR */}
        <section id="calculator" className="bg-gradient-to-b from-[#080d16] to-[#040810] border border-blue-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-3 py-1 rounded-full">
                Campaign Modeling Tool
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Estimate Campaign Reach &amp; Allocation</h2>
              <p className="text-xs text-gray-400 font-mono">
                Model reach across our network based on budget and preferred placement channels.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#03060a] p-1.5 rounded-xl border border-gray-800 text-xs font-mono">
              <button
                onClick={() => setSelectedNiche("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${selectedNiche === "all" ? "bg-blue-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                All Empire
              </button>
              <button
                onClick={() => setSelectedNiche("news")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${selectedNiche === "news" ? "bg-blue-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Tech &amp; AI
              </button>
              <button
                onClick={() => setSelectedNiche("crypto")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${selectedNiche === "crypto" ? "bg-blue-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Crypto &amp; DeFi
              </button>
              <button
                onClick={() => setSelectedNiche("finance")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${selectedNiche === "finance" ? "bg-blue-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Wall St Finance
              </button>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="space-y-4 bg-[#03060a] p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold">Planned Monthly Budget</span>
              <span className="text-2xl font-black text-white font-mono text-emerald-400">
                ${formatNumber(budgetSlider)} <span className="text-xs text-gray-500 font-normal">/ month</span>
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={25000}
              step={250}
              value={budgetSlider}
              onChange={(e) => setBudgetSlider(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$500 (Spotlight)</span>
              <span>$5,000 (Growth)</span>
              <span>$15,000 (Dominance)</span>
              <span>$25,000 (Exclusive Takeover)</span>
            </div>
          </div>

          {/* Projected Outcomes Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#03060a] p-5 rounded-2xl border border-gray-800 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Estimated Impressions</div>
              <div className="text-2xl font-black text-white">{formatNumber(estimatedImpressions)}</div>
              <div className="text-[10px] text-blue-400 font-mono">${cpmRate} CPM Benchmark</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-gray-800 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Projected Qualified Clicks</div>
              <div className="text-2xl font-black text-emerald-400">{formatNumber(estimatedClicks)}</div>
              <div className="text-[10px] text-gray-500 font-mono">Est. 2.8% CTR Model</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-gray-800 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Projected B2B Inquiries</div>
              <div className="text-2xl font-black text-purple-400">{formatNumber(estimatedLeads)}</div>
              <div className="text-[10px] text-gray-500 font-mono">High-Intent Readers</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Cost Advantage vs Ads</div>
              <div className="text-2xl font-black text-emerald-400">+{savingsPercent}%</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">vs Intermediary Networks</div>
            </div>
          </div>
        </section>

        {/* Sponsorship Packages & Rate Card */}
        <section id="packages" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Sponsorship Packages &amp; Placement Options</h2>
            <p className="text-xs text-gray-400 font-mono">Customized delivery, verified attribution tags, and dedicated editorial placement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="bg-[#080d16] border border-gray-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-gray-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                  Tier 1 • Spotlight
                </span>
                <h3 className="text-xl font-bold text-white">Newsletter Spotlight</h3>
                <div className="text-2xl font-black text-white">Contact for Quote</div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dedicated &quot;Presented By&quot; header banner + native contextual shoutout sent directly to our engaged subscriber list.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Top-of-Newsletter placement</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Targeted niche distribution</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Full UTM click tracking report</li>
                </ul>
              </div>
              <button
                onClick={() => selectPackage("Tier 1: Newsletter Spotlight", "Inquire", "all")}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
              >
                <span>Inquire for Tier 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tier 2 (Featured) */}
            <div className="bg-gradient-to-b from-[#0e1627] to-[#080d16] border border-blue-500/50 p-8 rounded-3xl flex flex-col justify-between space-y-6 relative shadow-2xl shadow-blue-950/60">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-lg">
                POPULAR FOR B2B
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/60">
                  Tier 2 • Channel Dominance
                </span>
                <h3 className="text-xl font-bold text-white">Niche Channel Sponsorship</h3>
                <div className="text-2xl font-black text-white">Custom Package</div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  High share-of-voice on your chosen niche channel (Tech, Crypto, or Finance). Includes persistent co-branded header bar + in-article native cards.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Co-branded header bar on target channel</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Native in-article responsive banner</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Priority placement on new editorial releases</li>
                </ul>
              </div>
              <button
                onClick={() => selectPackage("Tier 2: Niche Channel Sponsorship", "Custom", "news")}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Inquire for Tier 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-[#080d16] border border-gray-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-gray-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/60">
                  Tier 3 • Empire Partner
                </span>
                <h3 className="text-xl font-bold text-white">Multi-Domain Network Partner</h3>
                <div className="text-2xl font-black text-white">Enterprise Tier</div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Complete network-wide sponsor presence across all publications, newsletter editions, and co-branded longform analysis.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Network-wide homepage &amp; article placements</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Co-branded in-depth research guides</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated account support &amp; custom creative</li>
                </ul>
              </div>
              <button
                onClick={() => selectPackage("Tier 3: Multi-Domain Network Partner", "Enterprise", "all")}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
              >
                <span>Inquire for Tier 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* TECHNICAL PLACEMENT SPECIFICATIONS TABLE */}
        <section className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
              Creative Guidelines &amp; Tech Specs
            </span>
            <h3 className="text-2xl font-black text-white">Technical Placement Specifications</h3>
            <p className="text-xs text-gray-400 font-mono">
              All creative assets are validated for mobile responsiveness, zero ad-block disruption, and sub-50ms render times.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-[11px]">
                  <th className="py-3 px-4">Placement Unit</th>
                  <th className="py-3 px-4">Recommended Dimensions</th>
                  <th className="py-3 px-4">Copy Limit</th>
                  <th className="py-3 px-4">Supported Formats</th>
                  <th className="py-3 px-4">Attribution Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                <tr>
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Header Sponsor Bar
                  </td>
                  <td className="py-4 px-4">1200 x 60 px (Responsive)</td>
                  <td className="py-4 px-4">Headline + 140 chars description</td>
                  <td className="py-4 px-4">SVG, PNG, Dynamic Text</td>
                  <td className="py-4 px-4 text-emerald-400">UTM + Custom Pixels</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" /> In-Article Native Card
                  </td>
                  <td className="py-4 px-4">600 x 350 px (Fluid Card)</td>
                  <td className="py-4 px-4">Title + 180 chars + CTA button</td>
                  <td className="py-4 px-4">WebP, PNG, High-res JPG</td>
                  <td className="py-4 px-4 text-emerald-400">UTM + 1st-party redirects</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" /> Newsletter Lead Shoutout
                  </td>
                  <td className="py-4 px-4">600 x 200 px Top Banner</td>
                  <td className="py-4 px-4">120-150 words + Dedicated link</td>
                  <td className="py-4 px-4">HTML / Markdown + Image</td>
                  <td className="py-4 px-4 text-emerald-400">Full Open/Click Analytics</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Co-Branded Whitepaper
                  </td>
                  <td className="py-4 px-4">1,800+ Words E-E-A-T Guide</td>
                  <td className="py-4 px-4">Executive Case Study / Tool Teardown</td>
                  <td className="py-4 px-4">Markdown + Interactive Chart</td>
                  <td className="py-4 px-4 text-emerald-400">Direct Lead Capture (Gated)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Direct Booking Inquiry Form */}
        <section id="inquiry-form" className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Direct Sponsor Booking &amp; RFP</h2>
              <p className="text-xs text-gray-400 font-mono">Submit your campaign requirements below. Our executive partnerships desk responds within 2 hours.</p>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Sponsorship Request Dispatched</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                  Our partnerships team has received your RFP and sent an instant notification to the executive desk. We will reach out to <strong>{formData.contactEmail}</strong> with placement availability and your dedicated rate confirmation.
                </p>
                <Link
                  href="/advertise/portal"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  <span>Preview Sponsor Proof Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Company / Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Acme Technologies"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Business Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="partnerships@acme.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Target Publication Niche</label>
                    <select
                      value={formData.targetNiche}
                      onChange={(e) => setFormData({ ...formData, targetNiche: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="all">Entire Network (Tech + Crypto + Finance)</option>
                      <option value="news">The Trend Matrix (AI &amp; Tech)</option>
                      <option value="crypto">Crypto Daily (Web3 &amp; DeFi)</option>
                      <option value="finance">Wall St Insider (Markets &amp; Wealth)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Monthly Budget Tier</label>
                    <select
                      value={formData.budgetMonthly}
                      onChange={(e) => setFormData({ ...formData, budgetMonthly: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="$500 - $1,500">$500 - $1,500 (Spotlight / Newsletter)</option>
                      <option value="$1,500 - $3,500">$1,500 - $3,500 (Niche Subdomain Takeover)</option>
                      <option value="$3,500 - $10,000">$3,500 - $10,000 (Multi-Domain Growth)</option>
                      <option value="$10,000+">$10,000+ (Exclusive Empire Partner)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Selected Package / Placement</label>
                  <input
                    type="text"
                    value={formData.placementRequested}
                    onChange={(e) => setFormData({ ...formData, placementRequested: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Campaign Objectives &amp; Landing Page URL</label>
                  <textarea
                    rows={3}
                    placeholder="We want to drive signups for our AI developer tool. Target URL: https://acme.com/launch"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-mono font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Transmitting RFP..." : "Submit Sponsorship RFP (Instant Telegram Alert)"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
