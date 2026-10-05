"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Activity, Flame, ShieldCheck, Sparkles, DollarSign } from "lucide-react";

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  type: "crypto" | "macro" | "tech";
}

const INITIAL_MARKET_DATA: MarketItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: "$124,850", change: "+4.6%", isPositive: true, type: "crypto" },
  { symbol: "ETH", name: "Ethereum", price: "$4,180", change: "+3.2%", isPositive: true, type: "crypto" },
  { symbol: "SOL", name: "Solana", price: "$224.50", change: "+7.8%", isPositive: true, type: "crypto" },
  { symbol: "NVDA", name: "NVIDIA", price: "$188.40", change: "+3.9%", isPositive: true, type: "tech" },
  { symbol: "SPX", name: "S&P 500", price: "6,142.80", change: "+0.84%", isPositive: true, type: "macro" },
  { symbol: "GOLD", name: "Gold / Oz", price: "$2,748.20", change: "+0.45%", isPositive: true, type: "macro" },
  { symbol: "US10Y", name: "US 10Y Yield", price: "4.08%", change: "-0.04%", isPositive: false, type: "macro" },
  { symbol: "OPENAI", name: "AI Compute Index", price: "98.4", change: "+12.1%", isPositive: true, type: "tech" },
];

export default function GodModeLiveTicker({ niche = "all" }: { niche?: string }) {
  const [marketData, setMarketData] = useState<MarketItem[]>(INITIAL_MARKET_DATA);
  const [pulse, setPulse] = useState(false);

  // Filter based on niche if desired or show full empire breadth
  const displayItems = niche === "crypto" 
    ? marketData.filter(m => m.type === "crypto" || m.symbol === "BTC" || m.symbol === "SOL")
    : niche === "finance"
    ? marketData.filter(m => m.type === "macro" || m.type === "tech")
    : marketData;

  useEffect(() => {
    // Subtle real-time jitter simulation to create hyper-alive feel
    const interval = setInterval(() => {
      setMarketData((prev) =>
        prev.map((item) => {
          if (Math.random() > 0.6) {
            const delta = (Math.random() * 0.4 - 0.2).toFixed(2);
            const isPos = parseFloat(delta) >= 0;
            return {
              ...item,
              change: `${isPos ? "+" : ""}${delta}%`,
              isPositive: isPos,
            };
          }
          return item;
        })
      );
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#03060a] border-b border-gray-900/90 text-xs py-1.5 px-4 overflow-hidden relative select-none font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Status Pulse */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 border-r border-gray-800 pr-4">
          <span className={`w-2 h-2 rounded-full ${pulse ? "bg-cyan-400 scale-125" : "bg-emerald-400"} transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE TELEMETRY</span>
          <span className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
            NEXUS CORE
          </span>
        </div>

        {/* Marquee Streaming Items */}
        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="inline-flex items-center gap-6 animate-marquee">
            {displayItems.concat(displayItems).map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-[#070c14] border border-gray-800/80 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-gray-200 text-[11px]">{item.symbol}</span>
                <span className="text-gray-400 text-[11px]">{item.price}</span>
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    item.isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {item.isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sentiment Gauge */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 pl-4 border-l border-gray-800 text-[11px]">
          <span className="text-gray-400">Market Mood:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
            ⚡ Extreme Greed (78)
          </span>
        </div>

      </div>
    </div>
  );
}
