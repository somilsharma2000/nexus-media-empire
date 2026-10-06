"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, Zap, ShieldCheck, CheckCircle, AlertTriangle, ExternalLink, 
  Layers, DollarSign, TrendingUp, Info, ArrowUpRight, Lock, 
  RefreshCw, Check, Copy, Sliders, Sparkles, HelpCircle, Flame, Server
} from "lucide-react";

interface AdNetwork {
  id: string;
  name: string;
  type: "display" | "native" | "header_bidding" | "managed" | "direct";
  trafficReq: string;
  expectedRpmTier1: string;
  exclusivity: "non-exclusive" | "exclusive_display" | "flexible";
  envKey: string;
  placeholder: string;
  description: string;
  setupUrl: string;
  canCoexistWithAdSense: boolean;
  status: "active" | "ready" | "pending_traffic" | "exclusive_paused";
}

const AD_NETWORKS: AdNetwork[] = [
  {
    id: "adsense",
    name: "Google AdSense / Google Ad Manager",
    type: "display",
    trafficReq: "0 - 10k visits/mo (No min)",
    expectedRpmTier1: "$12 - $28 RPM",
    exclusivity: "non-exclusive",
    envKey: "NEXT_PUBLIC_ADSENSE_CLIENT",
    placeholder: "ca-pub-0000000000000000",
    description: "Foundational display ad network with global reach and instant programmatic fill.",
    setupUrl: "https://adsense.google.com",
    canCoexistWithAdSense: true,
    status: "active"
  },
  {
    id: "mediavine",
    name: "Mediavine / Journey by Mediavine",
    type: "managed",
    trafficReq: "10k (Journey) / 50k (Pro) sessions",
    expectedRpmTier1: "$35 - $65+ RPM",
    exclusivity: "exclusive_display",
    envKey: "MEDIAVINE_SITE_ID",
    placeholder: "med_site_123456",
    description: "Premium full-service lifestyle/tech/finance ad management with top Tier 1 advertiser bidding.",
    setupUrl: "https://www.mediavine.com",
    canCoexistWithAdSense: false,
    status: "ready"
  },
  {
    id: "raptive",
    name: "Raptive (formerly AdThrive)",
    type: "managed",
    trafficReq: "100k pageviews/mo (Tier 1 focus)",
    expectedRpmTier1: "$45 - $85+ RPM",
    exclusivity: "exclusive_display",
    envKey: "RAPTIVE_SITE_ID",
    placeholder: "rap_site_987654",
    description: "Elite ad network for high-traffic US/UK publishers with highest programmatic CPMs.",
    setupUrl: "https://raptive.com",
    canCoexistWithAdSense: false,
    status: "pending_traffic"
  },
  {
    id: "ezoic",
    name: "Ezoic AI Mediation",
    type: "display",
    trafficReq: "No minimum (Access Now)",
    expectedRpmTier1: "$18 - $35 RPM",
    exclusivity: "flexible",
    envKey: "EZOIC_PUBLISHER_ID",
    placeholder: "ezoic_pub_12345",
    description: "Automated AI machine-learning ad layout optimization and Google AdX mediation.",
    setupUrl: "https://www.ezoic.com",
    canCoexistWithAdSense: true,
    status: "ready"
  },
  {
    id: "buysellads",
    name: "BuySellAds (BSA)",
    type: "direct",
    trafficReq: "Quality tech/crypto audience",
    expectedRpmTier1: "$25 - $50 Fixed CPM",
    exclusivity: "non-exclusive",
    envKey: "BUYSELLADS_ZONE_KEY",
    placeholder: "bsa_zone_abc123",
    description: "Direct marketplace selling native tech & crypto sponsorship blocks to enterprise brands.",
    setupUrl: "https://www.buysellads.com",
    canCoexistWithAdSense: true,
    status: "ready"
  },
  {
    id: "taboola",
    name: "Taboola Native Feed",
    type: "native",
    trafficReq: "Any traffic level",
    expectedRpmTier1: "$8 - $18 RPM",
    exclusivity: "non-exclusive",
    envKey: "TABOOLA_PUBLISHER_ID",
    placeholder: "taboola_pub_network_id",
    description: "Native content recommendation widgets inserted at article end ('Around the Web').",
    setupUrl: "https://www.taboola.com",
    canCoexistWithAdSense: true,
    status: "ready"
  },
  {
    id: "outbrain",
    name: "Outbrain Amplify",
    type: "native",
    trafficReq: "Any traffic level",
    expectedRpmTier1: "$7 - $16 RPM",
    exclusivity: "non-exclusive",
    envKey: "OUTBRAIN_WIDGET_ID",
    placeholder: "outbrain_widget_01",
    description: "High-engagement editorial recommendation native links matching editorial styling.",
    setupUrl: "https://www.outbrain.com",
    canCoexistWithAdSense: true,
    status: "ready"
  },
  {
    id: "amazon_aps",
    name: "Amazon Publisher Services (APS) / Header Bidding",
    type: "header_bidding",
    trafficReq: "5k+ monthly visits",
    expectedRpmTier1: "+25% to +45% eCPM boost",
    exclusivity: "non-exclusive",
    envKey: "AMAZON_APS_PUB_ID",
    placeholder: "amzn_aps_pub_uuid",
    description: "Forces Amazon A9 demand to compete in real-time with Google AdSense for every impression.",
    setupUrl: "https://aps.amazon.com",
    canCoexistWithAdSense: true,
    status: "ready"
  },
  {
    id: "propeller",
    name: "PropellerAds / Monetag",
    type: "display",
    trafficReq: "Global traffic",
    expectedRpmTier1: "$10 - $22 RPM",
    exclusivity: "non-exclusive",
    envKey: "PROPELLER_ZONE_ID",
    placeholder: "prop_zone_554433",
    description: "In-page push notifications, multi-tag banners, and interstitial native monetization.",
    setupUrl: "https://monetag.com",
    canCoexistWithAdSense: true,
    status: "ready"
  }
];

export default function AdNetworkHub() {
  const [networkKeys, setNetworkKeys] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"networks" | "coexistence" | "tier1_geo" | "geo_schema">("networks");
  const [filterType, setFilterType] = useState<string>("all");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setNetworkKeys(data || {});
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveNetworkKey = async (envKey: string) => {
    setSavingKey(envKey);
    try {
      const val = networkKeys[envKey] || "";
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [envKey]: val })
      });
      if (res.ok) {
        setSaveSuccess(envKey);
        setTimeout(() => setSaveSuccess(null), 2500);
      }
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setSavingKey(null);
    }
  };

  const filteredNetworks = filterType === "all" 
    ? AD_NETWORKS 
    : AD_NETWORKS.filter((n) => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#060a12] border border-gray-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-mono font-medium flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> MULTI-NETWORK PROGRAMMATIC DESK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                TIER 1 HIGH-RPM OPTIMIZED
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Ad Networks &amp; Global Exchange Matrix</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Connect multiple programmatic ad exchanges, native content recommendation widgets, header bidders, and premium managed networks to maximize revenue per thousand impressions (RPM).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-[10px] font-mono text-gray-400">AVERAGE TIER 1 RPM</div>
              <div className="text-lg font-black text-emerald-400 font-mono">$38.50</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-[10px] font-mono text-gray-400">ACTIVE EXCHANGES</div>
              <div className="text-lg font-black text-blue-400 font-mono">9 Integrated</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-800/60">
          <button
            onClick={() => setActiveTab("networks")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "networks"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Ad Network Connectors ({AD_NETWORKS.length})
          </button>
          
          <button
            onClick={() => setActiveTab("coexistence")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "coexistence"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Multi-Partner Rules (Can We Use All?)
          </button>

          <button
            onClick={() => setActiveTab("tier1_geo")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "tier1_geo"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Tier 1 Country Targeting Strategy
          </button>

          <button
            onClick={() => setActiveTab("geo_schema")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "geo_schema"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> SEO + GEO (AI Citations) Architecture
          </button>
        </div>
      </div>

      {/* TAB 1: AD NETWORKS LIST */}
      {activeTab === "networks" && (
        <div className="space-y-4">
          {/* Sub-filter tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Filter Type:</span>
            {[
              { id: "all", label: "All Networks" },
              { id: "display", label: "Display & Mediation" },
              { id: "managed", label: "Managed (Mediavine/Raptive)" },
              { id: "native", label: "Native (Taboola/Outbrain)" },
              { id: "header_bidding", label: "Header Bidding" },
              { id: "direct", label: "Direct Marketplace" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterType === f.id
                    ? "bg-gray-800 text-white border border-gray-700 font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Network Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNetworks.map((net) => {
              const currentVal = networkKeys[net.envKey] || "";
              const isConfigured = Boolean(currentVal && currentVal.trim().length > 0);

              return (
                <div 
                  key={net.id}
                  className="p-5 rounded-2xl bg-[#090d16] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                          net.type === "managed" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" 
                            : net.type === "header_bidding"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : net.type === "native"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        }`}>
                          {net.type.replace("_", " ")}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5">{net.name}</h3>
                      </div>

                      {isConfigured ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 font-semibold shrink-0">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px] font-mono shrink-0">
                          Ready to Connect
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{net.description}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/50 text-[11px] font-mono">
                      <div>
                        <span className="text-gray-500 block text-[10px]">TIER 1 RPM:</span>
                        <span className="text-emerald-400 font-bold">{net.expectedRpmTier1}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">REQUIREMENT:</span>
                        <span className="text-gray-300 truncate block">{net.trafficReq}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-800/80">
                    <label className="text-[10px] font-mono text-gray-400 block font-semibold">
                      {net.envKey}
                    </label>
                    
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={networkKeys[net.envKey] || ""}
                        onChange={(e) => setNetworkKeys((prev) => ({ ...prev, [net.envKey]: e.target.value }))}
                        placeholder={net.placeholder}
                        className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/50 border border-gray-800 text-xs font-mono text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                      />
                      
                      <button
                        onClick={() => handleSaveNetworkKey(net.envKey)}
                        disabled={savingKey === net.envKey}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1"
                      >
                        {savingKey === net.envKey ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : saveSuccess === net.envKey ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        {net.canCoexistWithAdSense ? (
                          <span className="text-emerald-400">● Coexists with AdSense</span>
                        ) : (
                          <span className="text-amber-400">▲ Replaces AdSense Tags</span>
                        )}
                      </span>
                      <a 
                        href={net.setupUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        Partner Portal <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-NETWORK COEXISTENCE RULES */}
      {activeTab === "coexistence" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090d16] border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Can We Partner With All Ad Networks At The Same Time?
            </h3>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-emerald-400">YES — with standard digital publishing architecture rules.</strong> Digital publishing empires combine multiple revenue channels concurrently through a layered waterfall strategy:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Concurrent Stack */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle className="w-4 h-4" /> 100% Concurrent &amp; Fully Stackable
                </div>
                <p className="text-xs text-gray-300">
                  These can run together on every single page without any conflicts:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 font-mono list-disc pl-4">
                  <li><strong>Google AdSense</strong> (Display Banners &amp; In-Feed)</li>
                  <li><strong>Amazon APS / Prebid.js</strong> (Header Bidding multi-exchange)</li>
                  <li><strong>Taboola / Outbrain</strong> (Native 'Around the Web' footer cards)</li>
                  <li><strong>BuySellAds</strong> (Direct sidebar sponsorship slots)</li>
                  <li><strong>Affiliate Links</strong> (Amazon, Ledger, TradingView, Coinbase)</li>
                  <li><strong>Direct Client Sponsorships</strong> (Hero takeovers, newsletter)</li>
                </ul>
              </div>

              {/* Box 2: Managed Exclusive Networks */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" /> Managed Premium Networks (Mediavine / Raptive)
                </div>
                <p className="text-xs text-gray-300">
                  When your site reaches <strong>10,000 to 50,000 monthly sessions</strong>:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 font-mono list-disc pl-4">
                  <li>They require <strong>exclusive display ad management</strong>.</li>
                  <li>They replace standalone AdSense tags with their own Google AdX exchange script.</li>
                  <li>This boosts RPM from <strong>$15 up to $45-$80+</strong> in Tier 1 countries.</li>
                  <li><strong>You STILL keep</strong> 100% of your Affiliate links, Direct Sponsorships, and Newsletter revenue!</li>
                </ul>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-4 rounded-xl bg-black/50 border border-gray-800 space-y-2 mt-4 font-mono text-xs">
              <span className="text-gray-400 font-bold block text-[11px]">RECOMMENDED LIFECYCLE REVENUE ROADMAP:</span>
              <div className="space-y-1.5 text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 text-[10px]">STAGE 1 (Launch - 10k visits)</span>
                  <span>Google AdSense + Amazon APS Header Bidding + Dynamic Affiliate Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 text-[10px]">STAGE 2 (10k - 50k visits)</span>
                  <span>Add Taboola/Outbrain Native + Direct Client Sponsorships ($500-$2,500/mo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 text-[10px]">STAGE 3 (50k+ visits)</span>
                  <span>Graduate to Mediavine / Raptive for maximum $45-$85 RPM Tier 1 revenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIER 1 COUNTRY TARGETING */}
      {activeTab === "tier1_geo" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090d16] border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Why Focusing on Tier 1 Countries Yields 15x to 30x Higher Revenue
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              Advertisers bid on inventory based on the purchasing power of the audience. A visitor from the <strong>United States, UK, or Canada</strong> reading an article on AI or Finance is worth <strong>$35 to $85 RPM</strong>, whereas non-Tier 1 traffic averages only <strong>$0.80 to $2.50 RPM</strong>.
            </p>

            {/* Country Tier Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] font-mono text-gray-400 uppercase">
                    <th className="py-2.5 px-3">Target Country Group</th>
                    <th className="py-2.5 px-3">Countries Included</th>
                    <th className="py-2.5 px-3">Typical Display RPM</th>
                    <th className="py-2.5 px-3">Affiliate Conversion Val</th>
                    <th className="py-2.5 px-3">Targeting Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  <tr className="bg-emerald-950/20">
                    <td className="py-3 px-3 font-bold text-emerald-400">TIER 1 (Primary Target)</td>
                    <td className="py-3 px-3 text-gray-200">United States, United Kingdom, Canada, Australia, Germany, Switzerland, Singapore</td>
                    <td className="py-3 px-3 text-emerald-300 font-bold">$35.00 - $85.00+</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">$40 - $180 per sale</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">100% FOCUS</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-blue-400">TIER 2 (Secondary)</td>
                    <td className="py-3 px-3 text-gray-400">France, Italy, Spain, Netherlands, Japan, South Korea, UAE</td>
                    <td className="py-3 px-3 text-blue-300">$12.00 - $25.00</td>
                    <td className="py-3 px-3 text-blue-300">$20 - $60 per sale</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">Organic Spillover</span></td>
                  </tr>
                  <tr className="text-gray-500">
                    <td className="py-3 px-3 font-medium">TIER 3 (Low Monetization)</td>
                    <td className="py-3 px-3">Developing markets with low digital advertiser ad-spend</td>
                    <td className="py-3 px-3">$0.50 - $2.50</td>
                    <td className="py-3 px-3">$1 - $5 per sale</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400">Deprioritized</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* How our network locks into Tier 1 traffic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                <span className="text-xs font-bold text-white block">1. USD Currency &amp; US Regulation Angle</span>
                <p className="text-[11px] text-gray-400">All financial benchmarks, stock analyses (SPX, NVDA, AAPL), and crypto articles quote SEC, CFTC, and US Federal Reserve context.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                <span className="text-xs font-bold text-white block">2. High-Intent Commercial Queries</span>
                <p className="text-[11px] text-gray-400">Topics target 'Best X for 2026', 'Comparison', 'Pricing', and 'Security Review' that attract high-income Tier 1 buyers.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                <span className="text-xs font-bold text-white block">3. Global Edge CDN Acceleration</span>
                <p className="text-[11px] text-gray-400">Vercel &amp; Cloudflare Edge servers located in Washington, London, Frankfurt, and Sydney ensure sub-40ms page loads for Tier 1 users.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & GEO (AI CITATIONS) ARCHITECTURE */}
      {activeTab === "geo_schema" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090d16] border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              GEO (Generative Engine Optimization) &amp; Search Citation Engine
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              Traditional SEO targets Google 10 blue links. <strong>GEO (Generative Engine Optimization)</strong> guarantees your articles get cited as the authoritative source by <strong>Perplexity AI, ChatGPT Search, Claude, and Google AI Overviews</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <span className="text-xs font-bold text-purple-300 block">Active GEO Optimization Layers:</span>
                <ul className="text-xs text-gray-300 space-y-1.5 font-mono list-disc pl-4">
                  <li><strong>JSON-LD NewsArticle &amp; TechArticle Schema</strong>: Injected automatically into every page head with Author, DateModified, and Publisher entities.</li>
                  <li><strong>FAQPage Structured Data</strong>: Ingested directly by AI query parsers for direct answer extraction.</li>
                  <li><strong>Key Takeaways Bullet Blocks</strong>: Formatted at the top of every guide for instant LLM quotation.</li>
                  <li><strong>Empirical Data Comparison Tables</strong>: Ranked highest by Perplexity citation models.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <span className="text-xs font-bold text-blue-300 block">Instant Crawler Indexing Protocol:</span>
                <ul className="text-xs text-gray-300 space-y-1.5 font-mono list-disc pl-4">
                  <li><strong>Google Indexing API</strong>: Pings Googlebot immediately when a scheduled post goes live.</li>
                  <li><strong>IndexNow Protocol</strong>: Dispatches instant real-time URLs to Bing, DuckDuckGo, and Perplexity crawlers.</li>
                  <li><strong>Dynamic XML Sitemap</strong>: Auto-updated at <code>/sitemap.xml</code> with hourly priority weighting.</li>
                  <li><strong>Hardened robots.txt</strong>: Allows all ethical AI crawlers while shielding private admin routes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
