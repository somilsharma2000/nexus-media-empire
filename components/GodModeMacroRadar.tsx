"use client";

import React, { useState } from "react";
import { LineChart, TrendingUp, AlertCircle, Percent, ShieldCheck, DollarSign, BarChart3 } from "lucide-react";

export default function GodModeMacroRadar() {
  const [activeTab, setActiveTab] = useState<"fed" | "valuation" | "commodities">("fed");

  return (
    <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 sm:p-8 space-y-6 my-10 font-sans shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-gray-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Quantitative Macro &amp; Valuation Radar
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 uppercase">
              Bloomberg Feed
            </span>
          </div>
          <p className="text-xs text-gray-500 font-serif">Real-time interest rate probabilities and institutional risk valuation.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-300 text-xs font-bold font-sans">
          <button
            onClick={() => setActiveTab("fed")}
            className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "fed" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-black"}`}
          >
            Fed Rate Outlook
          </button>
          <button
            onClick={() => setActiveTab("valuation")}
            className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "valuation" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-black"}`}
          >
            S&amp;P 500 Multiples
          </button>
          <button
            onClick={() => setActiveTab("commodities")}
            className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "commodities" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-black"}`}
          >
            Energy &amp; Metals
          </button>
        </div>
      </div>

      {/* TAB 1: FED PROBABILITIES */}
      {activeTab === "fed" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">Next FOMC Meeting</div>
            <div className="text-2xl font-black text-gray-900">November 12</div>
            <div className="text-xs text-emerald-700 font-bold font-sans">78.2% Probability of 25bps Cut</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">Effective Fed Funds</div>
            <div className="text-2xl font-black text-gray-900">5.00% - 5.25%</div>
            <div className="text-xs text-gray-500 font-sans">Target Neutral: 3.25%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">US 2Y/10Y Yield Curve</div>
            <div className="text-2xl font-black text-emerald-700 font-sans">+18 bps</div>
            <div className="text-xs text-emerald-700 font-bold font-sans">Dis-inverted / Expansionary</div>
          </div>
        </div>
      )}

      {/* TAB 2: VALUATION MULTIPLES */}
      {activeTab === "valuation" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">S&amp;P 500 Forward P/E</div>
            <div className="text-2xl font-black text-gray-900">21.8x</div>
            <div className="text-xs text-amber-700 font-bold font-sans">5-Yr Avg: 19.4x (Slightly Rich)</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">Nasdaq-100 PEG Ratio</div>
            <div className="text-2xl font-black text-gray-900">1.42</div>
            <div className="text-xs text-emerald-700 font-bold font-sans">Growth Adjusted: Attractive</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">High-Yield Credit Spread</div>
            <div className="text-2xl font-black text-gray-900">294 bps</div>
            <div className="text-xs text-emerald-700 font-bold font-sans">Default Risk: Ultra-Low</div>
          </div>
        </div>
      )}

      {/* TAB 3: ENERGY & METALS */}
      {activeTab === "commodities" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">WTI Crude Oil</div>
            <div className="text-2xl font-black text-gray-900">$71.40 / bbl</div>
            <div className="text-xs text-gray-500 font-sans">OPEC+ Supply Restraint Active</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">Spot Gold</div>
            <div className="text-2xl font-black text-amber-700 font-sans">$2,748 / oz</div>
            <div className="text-xs text-amber-700 font-bold font-sans">Central Bank Reserves Inflow</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="text-xs font-bold text-gray-500 uppercase font-sans">Copper Futures</div>
            <div className="text-2xl font-black text-gray-900">$4.38 / lb</div>
            <div className="text-xs text-emerald-700 font-bold font-sans">AI Datacenter Demand High</div>
          </div>
        </div>
      )}

    </div>
  );
}
