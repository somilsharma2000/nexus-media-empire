"use client";

import React from "react";
import { Award, ExternalLink, ShieldCheck, Zap } from "lucide-react";

interface DynamicAffiliateBoxProps {
  niche: string;
}

export default function DynamicAffiliateBox({ niche }: DynamicAffiliateBoxProps) {
  const deals: Record<string, { title: string; badge: string; desc: string; link: string; cta: string; logo: string; reward: string }> = {
    news: {
      title: "Supabase & OpenAI Cloud Stack",
      badge: "Solo Founder Choice",
      desc: "Deploy serverless vector databases and AI endpoints with zero configuration overhead.",
      link: "https://supabase.com",
      cta: "Claim \$25 Free Credits",
      logo: "⚡",
      reward: "Verified Developer Tooling"
    },
    crypto: {
      title: "Ledger Flex Hardware Wallet",
      badge: "Editor's Security Pick",
      desc: "EAL6+ certified secure element. Protect your assets from exchange liquidations and drainers.",
      link: "https://ledger.com",
      cta: "Shop Official Store →",
      logo: "🛡️",
      reward: "Free Express Shipping"
    },
    finance: {
      title: "TradingView Pro Platform",
      badge: "Top Charting Suite",
      desc: "Real-time market depth, advanced Pine script indicators, and institutional screener access.",
      link: "https://tradingview.com",
      cta: "Start 30-Day Free Trial",
      logo: "📈",
      reward: "60% Off Annual Plan"
    }
  };

  const deal = deals[niche] || deals.news;

  return (
    <div className="my-8 p-5 rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-2 border-emerald-500/30 shadow-2xl relative">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{deal.logo}</span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {deal.badge}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {deal.reward}
        </span>
      </div>

      <h4 className="text-base font-bold text-white mb-1">
        {deal.title}
      </h4>
      <p className="text-xs text-gray-300 leading-relaxed mb-4">
        {deal.desc}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
        <span className="text-[10px] text-gray-500">
          * Sponsored Disclosure: We may earn a commission from partner links at no cost to you.
        </span>
        <a
          href={deal.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-95"
        >
          <span>{deal.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
