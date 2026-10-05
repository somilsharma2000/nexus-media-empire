"use client";

import React, { useState, useEffect } from "react";
import { Zap, ShieldCheck, ArrowRight, Sparkles, TrendingUp, Lock } from "lucide-react";
import { 
  getBehaviorProfile, 
  trackDwellTime, 
  trackScrollDepth, 
  trackHighIntentInteraction,
  getSmartContextualOffer,
  UserBehaviorProfile 
} from "../lib/behavioral-engine";

interface SmartBehavioralAdProps {
  niche: string;
  placement?: "in_article" | "mid_feed" | "sidebar" | "sticky_footer";
}

export default function SmartBehavioralAdUnit({ niche, placement = "in_article" }: SmartBehavioralAdProps) {
  const [profile, setProfile] = useState<UserBehaviorProfile | null>(null);
  const [activeOffer, setActiveOffer] = useState<any>(null);

  useEffect(() => {
    // Initial profile load
    const p = getBehaviorProfile();
    setProfile(p);
    setActiveOffer(getSmartContextualOffer(niche, p));

    // Dwell tracker interval
    const dwellInterval = setInterval(() => {
      const updated = trackDwellTime(3);
      setProfile({ ...updated });
      setActiveOffer(getSmartContextualOffer(niche, updated));
    }, 3000);

    // Scroll depth listener
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const scrolled = (window.scrollY / totalHeight) * 100;
        const updated = trackScrollDepth(scrolled);
        setProfile({ ...updated });
        setActiveOffer(getSmartContextualOffer(niche, updated));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearInterval(dwellInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [niche]);

  if (!activeOffer) return null;

  const isHighIntent = profile?.engagementTier === "high_intent_buyer";
  const isDeepDiver = profile?.engagementTier === "deep_diver";

  const handleOfferClick = () => {
    trackHighIntentInteraction("affiliate");
    if (activeOffer.ctaUrl.startsWith("/")) {
      window.location.href = activeOffer.ctaUrl;
    } else if (activeOffer.ctaUrl.startsWith("#")) {
      const target = document.querySelector(activeOffer.ctaUrl);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(activeOffer.ctaUrl, "_blank");
    }
  };

  return (
    <div
      onClick={handleOfferClick}
      className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-300 border my-8 ${
        isHighIntent
          ? "bg-gradient-to-br from-[#0c1424] via-[#09101b] to-[#04070d] border-blue-500/40 shadow-2xl shadow-blue-900/20 hover:border-blue-400"
          : isDeepDiver
          ? "bg-[#090d16] border-purple-500/30 shadow-xl hover:border-purple-400/50"
          : "bg-[#070a10] border-gray-800/80 hover:border-gray-700"
      }`}
    >
      {/* Background ambient glow on high intent */}
      {isHighIntent && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      )}

      {/* Header telemetry badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
            isHighIntent
              ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
              : isDeepDiver
              ? "bg-purple-950/60 border-purple-800/60 text-purple-300"
              : "bg-gray-900 border-gray-800 text-gray-400"
          }`}>
            <Sparkles className="w-3 h-3" />
            {activeOffer.badge}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {profile?.engagementTier === "high_intent_buyer" ? "Intent Match: 98%" : "Contextual Placement"}
          </span>
        </div>

        <span className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1 bg-amber-950/30 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400/40" />
          {activeOffer.urgency}
        </span>
      </div>

      {/* Main Content */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-blue-300 transition-colors flex items-center gap-2">
          {activeOffer.headline}
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed max-w-2xl font-normal">
          {activeOffer.subtext}
        </p>
      </div>

      {/* Action CTA Bar */}
      <div className="mt-6 pt-5 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Editorial Verified
          </span>
          <span>•</span>
          <span>Zero Spam Policy</span>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform">
          <span>{activeOffer.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
