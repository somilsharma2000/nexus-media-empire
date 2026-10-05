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
  Award
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
    placementRequested: "Subdomain Takeover + Weekly Newsletter Blast",
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
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center py-4">
          <Link href="/news" className="flex items-center gap-2.5 text-xs text-gray-400 hover:text-white font-semibold transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" /> Return to Network
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-mono font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> High-Value Executive, Trader &amp; Founder Readership
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Put Your Brand in Front of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">840,000+</span> Decision Makers.
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-normal">
            Nexus Media operates high-retention authoritative digital publications across Technology, Cryptocurrency, and Quantitative Finance. Direct brand sponsorships, co-branded intelligence guides, and high-CTR header takeovers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="#calculator"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <Calculator className="w-4 h-4" /> Calculate Campaign ROI
            </a>
            <a
              href="#packages"
              className="px-6 py-3 bg-[#080d16] hover:bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              View Rate Cards &amp; Specs
            </a>
          </div>
        </section>

        {/* Verified Audience Demographics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-3xl font-black text-white">840K+</div>
            <div className="text-xs text-gray-400 font-mono uppercase font-bold">Monthly Pageviews</div>
            <p className="text-[11px] text-emerald-400 font-mono pt-1">+24.5% MoM Growth</p>
          </div>

          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-3xl font-black text-white">74.2%</div>
            <div className="text-xs text-gray-400 font-mono uppercase font-bold">Tier-1 Traffic</div>
            <p className="text-[11px] text-gray-500 font-mono pt-1">USA, UK, CA, DE, AUS</p>
          </div>

          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-3xl font-black text-white">$142,000</div>
            <div className="text-xs text-gray-400 font-mono uppercase font-bold">Median Reader HHI</div>
            <p className="text-[11px] text-gray-500 font-mono pt-1">Founders, C-Suite, Traders</p>
          </div>

          <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl text-center space-y-1">
            <div className="text-3xl font-black text-white">3m 42s</div>
            <div className="text-xs text-gray-400 font-mono uppercase font-bold">Avg Dwell Time</div>
            <p className="text-[11px] text-blue-400 font-mono pt-1">Top 5% Industry Benchmarks</p>
          </div>
        </section>

        {/* INTERACTIVE CAMPAIGN ROI & IMPRESSION CALCULATOR */}
        <section id="calculator" className="bg-gradient-to-b from-[#080d16] to-[#040810] border border-blue-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-3 py-1 rounded-full">
                Interactive ROI Estimator
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Calculate Your Campaign Reach &amp; Projected ROI</h2>
              <p className="text-xs text-gray-400 font-mono">
                Real-time projection based on historical 2.8% CTR &amp; 6.5% high-intent B2B conversion data.
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
              <div className="text-xs font-mono text-gray-400">Guaranteed Impressions</div>
              <div className="text-2xl font-black text-white">{formatNumber(estimatedImpressions)}</div>
              <div className="text-[10px] text-blue-400 font-mono">${cpmRate} CPM Benchmark</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-gray-800 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Projected Qualified Clicks</div>
              <div className="text-2xl font-black text-emerald-400">{formatNumber(estimatedClicks)}</div>
              <div className="text-[10px] text-gray-500 font-mono">2.8% Average CTR</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-gray-800 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Projected B2B Leads</div>
              <div className="text-2xl font-black text-purple-400">{formatNumber(estimatedLeads)}</div>
              <div className="text-[10px] text-gray-500 font-mono">High-Intent Founders</div>
            </div>

            <div className="bg-[#03060a] p-5 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 text-center space-y-1">
              <div className="text-xs font-mono text-gray-400">Cost Advantage vs Ads</div>
              <div className="text-2xl font-black text-emerald-400">+{savingsPercent}%</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">vs Google / LinkedIn Ads</div>
            </div>
          </div>
        </section>

        {/* Sponsorship Packages & Rate Card */}
        <section id="packages" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Sponsorship Packages &amp; Placement Specs</h2>
            <p className="text-xs text-gray-400 font-mono">Guaranteed impressions, verified attribution tags, and dedicated editorial placement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="bg-[#080d16] border border-gray-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-gray-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                  Tier 1 • Spotlight
                </span>
                <h3 className="text-xl font-bold text-white">Newsletter Sponsor</h3>
                <div className="text-3xl font-black text-white">$499 <span className="text-xs font-normal text-gray-500 font-mono">/ send</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dedicated &quot;Presented By&quot; header banner + 120-word native shoutout sent directly to 12,000+ verified executive subscribers.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Top-of-Newsletter placement</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Guaranteed 42%+ open rate</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Full UTM click tracking report</li>
                </ul>
              </div>
            </div>

            {/* Tier 2 (Featured) */}
            <div className="bg-gradient-to-b from-[#0e1627] to-[#080d16] border border-blue-500/50 p-8 rounded-3xl flex flex-col justify-between space-y-6 relative shadow-2xl shadow-blue-950/60">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-lg">
                MOST POPULAR FOR B2B
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/60">
                  Tier 2 • Subdomain Dominance
                </span>
                <h3 className="text-xl font-bold text-white">30-Day Niche Takeover</h3>
                <div className="text-3xl font-black text-white">$1,499 <span className="text-xs font-normal text-gray-500 font-mono">/ month</span></div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  100% Share of Voice on your chosen niche (Tech, Crypto, or Finance). Includes persistent co-branded header bar + in-article native cards.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Co-branded header bar on all pages</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Native in-article responsive banner</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> 250,000+ guaranteed impressions</li>
                </ul>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-[#080d16] border border-gray-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-gray-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/60">
                  Tier 3 • Empire Partner
                </span>
                <h3 className="text-xl font-bold text-white">Multi-Domain Dominance</h3>
                <div className="text-3xl font-black text-white">$3,999 <span className="text-xs font-normal text-gray-500 font-mono">/ month</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Complete network-wide sponsor takeover across all 3 publications, 4 weekly newsletter editions, and 2 co-branded longform whitepapers.
                </p>
                <ul className="text-xs text-gray-300 space-y-2 font-mono pt-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Network-wide homepage &amp; article takeovers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> 2 Co-branded E-E-A-T research guides</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated account manager &amp; custom creative</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Booking Inquiry Form */}
        <section className="bg-[#080d16] border border-gray-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
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
                <p className="text-xs text-gray-300 max-w-md mx-auto">
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
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Company / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Ledger / NordLayer / Kraken"
                      className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Work Email</label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="partner@company.com"
                      className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Monthly Ad Budget</label>
                    <select
                      value={formData.budgetMonthly}
                      onChange={(e) => setFormData({ ...formData, budgetMonthly: e.target.value })}
                      className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="$1,000 - $2,500">$1,000 - $2,500 / month</option>
                      <option value="$2,500 - $5,000">$2,500 - $5,000 / month</option>
                      <option value="$5,000 - $15,000">$5,000 - $15,000 / month</option>
                      <option value="$15,000+">$15,000+ (Enterprise Network Dominance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Target Publication / Niche</label>
                    <select
                      value={formData.targetNiche}
                      onChange={(e) => setFormData({ ...formData, targetNiche: e.target.value })}
                      className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="all">Entire Empire (Tech + Crypto + Finance)</option>
                      <option value="news">The Trend Matrix (Tech &amp; AI Enterprise)</option>
                      <option value="crypto">Crypto Daily (DeFi, Traders, Whales)</option>
                      <option value="finance">Wall St Insider (Investors, HNW, Wealth)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Desired Sponsorship Package</label>
                  <select
                    value={formData.placementRequested}
                    onChange={(e) => setFormData({ ...formData, placementRequested: e.target.value })}
                    className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="Subdomain Takeover + Weekly Newsletter Blast">30-Day Subdomain Takeover + Weekly Newsletter Blast</option>
                    <option value="Dedicated Co-Branded Editorial Intelligence Guide">Dedicated Co-Branded Editorial Intelligence Guide ($999)</option>
                    <option value="Weekly Newsletter Spotlight Only">Weekly Newsletter Spotlight Only ($499/send)</option>
                    <option value="Empire-Wide Multi-Domain Dominance">Empire-Wide Multi-Domain Dominance ($3,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Campaign Goals &amp; Special Requests</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Provide any specific landing page URLs, custom tracking requirements, or launch timing..."
                    className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold font-mono shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Sponsorship RFP &amp; Lock Rates</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900 bg-black mt-20 py-12 text-center text-xs text-gray-500 font-mono">
        Nexus Autonomous Media Network • Direct Brand Partnerships Desk © 2026
      </footer>

      <CookieConsent />
    </div>
  );
}
