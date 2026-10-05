"use client";

import React, { useState } from "react";
import { 
  Layers, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Layout, 
  Sparkles, 
  MousePointer, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Sliders,
  CheckCircle2,
  FileCode,
  Package,
  Share2
} from "lucide-react";

interface SlotDetail {
  id: string;
  name: string;
  pageType: "article" | "hub" | "global";
  placement: string;
  format: string;
  viewability: string;
  targetRpm: string;
  triggerCondition: string;
  behavioralTargeting: string;
}

const INVENTORY_MATRIX: SlotDetail[] = [
  {
    id: "slot-art-top",
    name: "1. Sticky Brand Takeover Ribbon",
    pageType: "article",
    placement: "Above Navigation (Sticky)",
    format: "Enterprise Native Ribbon (Desktop/Mobile)",
    viewability: "98.4%",
    targetRpm: "$35 - $60 CPM",
    triggerCondition: "Immediate page mount (0.0s)",
    behavioralTargeting: "Direct B2B Enterprise Sponsors (NordLayer, Kraken, Carta)"
  },
  {
    id: "slot-art-mid1",
    name: "2. In-Article High-Impact Unit #1",
    pageType: "article",
    placement: "After Paragraph 3",
    format: "Responsive Display / AdSense (728x90 or 300x250)",
    viewability: "89.2%",
    targetRpm: "$22 - $38 CPM",
    triggerCondition: "Scroll depth > 25%",
    behavioralTargeting: "Contextual keyword affinity (AI, Crypto, Cloud)"
  },
  {
    id: "slot-art-audio",
    name: "3. AI Voice Narration Sponsor Tag",
    pageType: "article",
    placement: "Pre-Roll Audio Header",
    format: "Audio Ad Insertion (15s pre-roll + visual logo)",
    viewability: "94.0%",
    targetRpm: "$45 - $70 Audio CPM",
    triggerCondition: "Audio Play button click",
    behavioralTargeting: "High-dwell power listeners"
  },
  {
    id: "slot-art-tool",
    name: "4. Interactive Tool & Digital Asset Funnel",
    pageType: "article",
    placement: "Mid-Article Anchor (45% Depth)",
    format: "Embedded Calculator + $0 COGS Digital Product",
    viewability: "86.5%",
    targetRpm: "100% Margin ($49 - $199 Sales)",
    triggerCondition: "User slider manipulation",
    behavioralTargeting: "High-intent investors & engineers"
  },
  {
    id: "slot-art-mid2",
    name: "5. In-Article Deep Content Unit #2",
    pageType: "article",
    placement: "After Paragraph 7 / Pre-Conclusion",
    format: "Native Contextual Card",
    viewability: "78.0%",
    targetRpm: "$18 - $28 CPM",
    triggerCondition: "Scroll depth > 60%",
    behavioralTargeting: "Engaged long-form readers"
  },
  {
    id: "slot-art-exit",
    name: "6. Behavioral Exit-Intent Lead Magnet",
    pageType: "article",
    placement: "Full-Screen Modal Overlay",
    format: "Newsletter Capture + Free VIP Asset",
    viewability: "100% (Interactive)",
    targetRpm: "$3 - $6 CPA / Subscriber",
    triggerCondition: "Mouse exit velocity > 800px/s or 45s dwell",
    behavioralTargeting: "Unconverted high-value traffic"
  },
  {
    id: "slot-hub-telemetry",
    name: "7. Global Telemetry Sponsor Pill",
    pageType: "hub",
    placement: "Live Telemetry Ticker Header",
    format: "Financial Index Micro-Sponsorship",
    viewability: "99.1%",
    targetRpm: "$25 - $40 CPM",
    triggerCondition: "Continuous real-time stream",
    behavioralTargeting: "Macro traders and institutional readers"
  },
  {
    id: "slot-hub-feed",
    name: "8. In-Feed Native Editorial Card",
    pageType: "hub",
    placement: "Every 4th Grid Item",
    format: "Seamless Editorial Sponsored Card",
    viewability: "82.4%",
    targetRpm: "$28 - $45 CPM (2.8% CTR)",
    triggerCondition: "In-viewport intersection observer",
    behavioralTargeting: "B2B SaaS / Exchange signups"
  },
  {
    id: "slot-hub-sidebar",
    name: "9. Sticky Sidebar Asset Showcase",
    pageType: "hub",
    placement: "Right Rail (Desktop)",
    format: "Featured Digital Product / Hardware Wallet",
    viewability: "88.0%",
    targetRpm: "$30 - $50 Commission/Sale",
    triggerCondition: "Sticky scroll until footer",
    behavioralTargeting: "Tool buyers & hardware purchasers"
  }
];

export default function MonetizationBlueprint() {
  const [selectedView, setSelectedView] = useState<"article" | "hub">("article");
  const [activeSlotId, setActiveSlotId] = useState<string>("slot-art-top");

  const filteredSlots = INVENTORY_MATRIX.filter(s => selectedView === "article" ? s.pageType === "article" : s.pageType === "hub");
  const activeSlot = INVENTORY_MATRIX.find(s => s.id === activeSlotId) || INVENTORY_MATRIX[0];

  return (
    <div className="space-y-8 text-gray-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#080d18] via-[#0d1627] to-[#080d18] border border-blue-900/40 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> High-RPM Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ad Inventory &amp; Funnel Density Blueprint
          </h2>
          <p className="text-xs text-gray-400 max-w-xl">
            Empirically engineered placement density balancing 100% reader retention with $35-$60 blended CPM monetization across 3 media publications.
          </p>
        </div>

        {/* Global Inventory Counter Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-black/60 border border-gray-800 p-4 rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Total Slots</span>
            <div className="text-2xl font-black text-white font-mono">18 Units</div>
          </div>
          <div className="bg-black/60 border border-gray-800 p-4 rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Avg Viewability</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">89.4%</div>
          </div>
          <div className="bg-black/60 border border-gray-800 p-4 rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Target Blended RPM</span>
            <div className="text-2xl font-black text-blue-400 font-mono">$42.50</div>
          </div>
        </div>
      </div>

      {/* Interactive Mode Switcher */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedView("article"); setActiveSlotId("slot-art-top"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedView === "article" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                : "bg-gray-900 text-gray-400 hover:text-white"
            }`}
          >
            <Layout className="w-4 h-4" /> Article Page Layout (6 Slots)
          </button>
          <button
            onClick={() => { setSelectedView("hub"); setActiveSlotId("slot-hub-telemetry"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedView === "hub" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                : "bg-gray-900 text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> Category Hub Layout (3 Slots)
          </button>
        </div>

        <span className="text-xs text-gray-500 font-mono hidden sm:inline">
          Click any slot to inspect live trigger mechanics
        </span>
      </div>

      {/* Two Column Visualizer & Slot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Page Wireframe Simulator */}
        <div className="lg:col-span-5 bg-[#05080f] border border-gray-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <span className="text-xs font-bold text-gray-400 uppercase font-mono flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Interactive Viewport Simulator
            </span>
            <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-900">
              {selectedView === "article" ? "/[niche]/[slug]" : "/news | /crypto | /finance"}
            </span>
          </div>

          {/* Wireframe Mockup */}
          <div className="space-y-3 font-mono text-xs">
            
            {selectedView === "article" ? (
              <>
                {/* 1. Top Ribbon */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-top")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-top" 
                      ? "bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-blue-400" /> 1. Sticky Top Sponsor Ribbon</span>
                  <span className="text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-300">98% View</span>
                </div>

                {/* Article Header Mock */}
                <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-2 opacity-60">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-900 rounded w-1/2"></div>
                </div>

                {/* 2. Audio Narration Unit */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-audio")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-audio" 
                      ? "bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-cyan-400" /> 2. AI Audio Player &amp; Audio Ad</span>
                  <span className="text-[10px] bg-cyan-900/60 px-1.5 py-0.5 rounded text-cyan-300">Pre-Roll</span>
                </div>

                {/* Text Paragraphs */}
                <div className="p-3 bg-gray-950/40 border border-gray-900 rounded-xl space-y-1.5 opacity-40">
                  <div className="h-2 bg-gray-800 rounded w-full"></div>
                  <div className="h-2 bg-gray-800 rounded w-5/6"></div>
                </div>

                {/* 3. In-Article Mid 1 */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-mid1")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-mid1" 
                      ? "bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><MousePointer className="w-3.5 h-3.5 text-emerald-400" /> 3. Native Ad Slot (Para 3)</span>
                  <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">AdSense/CPA</span>
                </div>

                {/* 4. Interactive Calculator Funnel */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-tool")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-tool" 
                      ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-purple-400" /> 4. Interactive Tool / Digital Product</span>
                  <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-300">100% Margin</span>
                </div>

                {/* 5. In-Article Mid 2 */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-mid2")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-mid2" 
                      ? "bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-amber-400" /> 5. Deep Contextual Unit #2</span>
                  <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-300">Para 7</span>
                </div>

                {/* 6. Exit Intent Modal */}
                <div 
                  onClick={() => setActiveSlotId("slot-art-exit")}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-art-exit" 
                      ? "bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-red-400" /> 6. Exit-Intent Lead Magnet</span>
                  <span className="text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded text-red-300">Flywheel</span>
                </div>
              </>
            ) : (
              <>
                {/* 7. Hub Telemetry */}
                <div 
                  onClick={() => setActiveSlotId("slot-hub-telemetry")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-hub-telemetry" 
                      ? "bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-blue-400" /> 7. Live Telemetry Sponsor</span>
                  <span className="text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-300">99% View</span>
                </div>

                {/* Hero Content */}
                <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-2 opacity-60">
                  <div className="h-4 bg-gray-800 rounded w-full"></div>
                </div>

                {/* 8. In-Feed Native Card */}
                <div 
                  onClick={() => setActiveSlotId("slot-hub-feed")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-hub-feed" 
                      ? "bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><MousePointer className="w-3.5 h-3.5 text-emerald-400" /> 8. In-Feed Editorial Card (Item 4)</span>
                  <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">2.8% CTR</span>
                </div>

                {/* 9. Sidebar Sticky */}
                <div 
                  onClick={() => setActiveSlotId("slot-hub-sidebar")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSlotId === "slot-hub-sidebar" 
                      ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50" 
                      : "bg-[#09111e] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-purple-400" /> 9. Sticky Rail Digital Asset Box</span>
                  <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-300">Rail</span>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Right Column: Slot Deep-Dive Specs & Monetization Engine */}
        <div className="lg:col-span-7 bg-[#05080f] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="flex justify-between items-start border-b border-gray-800/80 pb-4">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-widest">
                Unit Specification
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {activeSlot.name}
              </h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-500 uppercase">Target Yield</span>
              <div className="text-lg font-black text-emerald-400">{activeSlot.targetRpm}</div>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-1">
              <span className="text-gray-500">Placement Zone</span>
              <p className="text-white font-bold">{activeSlot.placement}</p>
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-1">
              <span className="text-gray-500">Audience Viewability</span>
              <p className="text-blue-400 font-bold">{activeSlot.viewability}</p>
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-1">
              <span className="text-gray-500">Trigger Logic</span>
              <p className="text-emerald-400 font-bold">{activeSlot.triggerCondition}</p>
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl space-y-1">
              <span className="text-gray-500">Creative Format</span>
              <p className="text-purple-400 font-bold">{activeSlot.format}</p>
            </div>
          </div>

          {/* Behavioral Targeting Rationale */}
          <div className="p-5 bg-blue-950/20 border border-blue-900/40 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Behavioral Algorithm &amp; Value Multiplier
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {activeSlot.behavioralTargeting}. This slot is programmatically throttled to a frequency cap of 1 view per session to maximize CPM pricing while preserving 100% reader loyalty.
            </p>
          </div>

          {/* Direct Publisher Connection Workflow */}
          <div className="pt-2 border-t border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase font-mono">
              Internal Network Connection Flow
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                <span className="text-gray-500 text-[9px] block">1. TRAFFIC INGESTION</span>
                <span className="text-white font-bold">SEO / Twitter / RSS</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                <span className="text-gray-500 text-[9px] block">2. ENGAGEMENT</span>
                <span className="text-blue-400 font-bold">Voice + Calculator</span>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                <span className="text-emerald-400 text-[9px] block">3. MONETIZATION</span>
                <span className="text-emerald-300 font-bold">$0 COGS &amp; IO Deals</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
