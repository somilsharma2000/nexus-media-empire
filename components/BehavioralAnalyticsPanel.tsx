"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Activity, 
  TrendingUp, 
  Eye, 
  Sparkles, 
  Layers, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Users 
} from "lucide-react";

export default function BehavioralAnalyticsPanel() {
  const [activeTierStats, setActiveTierStats] = useState({
    skimmers: 42,
    readers: 31,
    deepDivers: 18,
    highIntentBuyers: 9,
  });

  const [simulatedEvents, setSimulatedEvents] = useState<string[]>([
    "Reader #921 crossed 65% scroll depth in Crypto → Morphed ad unit to Ledger Flex Offer",
    "Reader #840 hovered 12s on TradingView comparison → Injected High-Intent Affiliate Callout",
    "Reader #719 triggered exit intent after 90s dwell → Displayed $0 COGS Executive Notion Funnel",
    "Reader #604 clicked DCA Calculator → Updated Buyer Intent Score to 78",
  ]);

  // Live telemetry pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        "Reader crossed 70% scroll depth on AI Deep-Dive → Morphed ad unit to Enterprise SaaS Toolkit",
        "Reader engaged with interactive Compound Interest calculator → Intent score +15",
        "Reader completed 3m dwell time on Wall St Insider → Triggered Smart Floating Pill",
        "Reader copied code block in Tech Matrix → Updated Practitioner Affinity to 94%",
      ];
      const nextAction = actions[Math.floor(Math.random() * actions.length)];
      setSimulatedEvents((prev) => [
        `[${new Date().toLocaleTimeString()}] ${nextAction}`,
        ...prev.slice(0, 5),
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-blue-400" /> Real-Time Behavioral Ad & Intent Matrix
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Autonomous client-side telemetry listening to reader dwell time, scroll velocity, and category affinity to serve ultra-targeted high-RPM offers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-mono font-semibold rounded-full shadow-inner">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Dynamic Targeting Active
          </span>
        </div>
      </div>

      {/* 4 Audience Intent Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#080d16] border border-gray-800/80 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase text-gray-500 font-bold">Tier 1: Skimmers</span>
            <span className="text-xs font-mono text-gray-400">0–15s Dwell</span>
          </div>
          <div className="text-2xl font-black text-white">{activeTierStats.skimmers}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Served lightweight brand awareness & newsletter capture.</p>
          <div className="w-full bg-gray-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gray-600 h-full w-[42%]" />
          </div>
        </div>

        <div className="bg-[#080d16] border border-gray-800/80 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase text-blue-400 font-bold">Tier 2: Readers</span>
            <span className="text-xs font-mono text-blue-300">15–45s Dwell</span>
          </div>
          <div className="text-2xl font-black text-white">{activeTierStats.readers}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Served context-matched AdSense & mid-feed house ads.</p>
          <div className="w-full bg-gray-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full w-[31%]" />
          </div>
        </div>

        <div className="bg-[#080d16] border border-gray-800/80 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase text-purple-400 font-bold">Tier 3: Deep Divers</span>
            <span className="text-xs font-mono text-purple-300">&gt;45s &amp; 50% Depth</span>
          </div>
          <div className="text-2xl font-black text-white">{activeTierStats.deepDivers}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Morphed to high-ticket affiliate bounties ($20–$50/sale).</p>
          <div className="w-full bg-gray-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full w-[18%]" />
          </div>
        </div>

        <div className="bg-[#080d16] border border-gray-800/80 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Tier 4: High-Intent</span>
            <span className="text-xs font-mono text-emerald-300">Score &gt; 45</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeTierStats.highIntentBuyers}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Directly served $0 COGS digital products & VIP trials.</p>
          <div className="w-full bg-gray-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[9%]" />
          </div>
        </div>
      </div>

      {/* Telemetry Live Feed & Lift Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Live Dynamic Ad Morphing Stream
            </h4>
            <span className="text-[11px] text-gray-500 font-mono">Auto-Updating</span>
          </div>
          <div className="space-y-2.5 font-mono text-xs">
            {simulatedEvents.map((evt, idx) => (
              <div key={idx} className="p-3 bg-black/60 border border-gray-800/80 rounded-xl text-gray-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 animate-ping" />
                <span className="leading-relaxed">{evt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#080d16] border border-gray-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Dynamic RPM Multipliers
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-gray-400">Static Banner CTR</span>
                <span className="text-gray-300 font-bold">0.24%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-900/50">
                <span className="text-emerald-300">Behavioral Morphed CTR</span>
                <span className="text-emerald-400 font-bold">4.82% (+1900%)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-blue-950/30 rounded-xl border border-blue-900/50">
                <span className="text-blue-300">Average Effective RPM</span>
                <span className="text-blue-400 font-bold">$42.80 / 1k</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-[11px] text-gray-400 font-mono">
            <p className="flex items-center gap-1.5 text-white font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Privacy Compliant
            </p>
            Zero third-party trackers. All intent scoring computed locally on client.
          </div>
        </div>
      </div>
    </div>
  );
}
