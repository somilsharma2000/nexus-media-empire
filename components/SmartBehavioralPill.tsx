"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, Zap } from "lucide-react";
import { getBehaviorProfile, trackHighIntentInteraction, UserBehaviorProfile } from "../lib/behavioral-engine";

interface SmartPillProps {
  niche: string;
}

export default function SmartBehavioralPill({ niche }: SmartPillProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [profile, setProfile] = useState<UserBehaviorProfile | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const scrolled = (window.scrollY / totalHeight) * 100;
        if (scrolled >= 45 && !visible) {
          const p = getBehaviorProfile();
          setProfile(p);
          setVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed, visible]);

  if (!visible || dismissed) return null;

  const handleAction = () => {
    trackHighIntentInteraction("product_preview");
    if (niche === "crypto") {
      window.location.href = "/go/ledger-wallet";
    } else if (niche === "finance") {
      window.location.href = "/go/tradingview-pro";
    } else {
      window.location.href = "/news";
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#090d16]/95 border border-blue-500/40 p-3.5 sm:px-5 sm:py-3 rounded-full backdrop-blur-xl shadow-2xl shadow-blue-950/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 border border-blue-400/40">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">
              {niche === "crypto" ? "2026 Crypto Asset Security Guide" : niche === "finance" ? "Wall St Screener 30-Day Pass" : "Nexus Tech Intelligence Digest"}
            </p>
            <p className="text-[10px] text-gray-400 font-mono hidden sm:block">Verified by Nexus Editorial Analysts</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAction}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold font-mono transition-all flex items-center gap-1 shadow-md shadow-blue-600/30"
          >
            <span>Claim</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
