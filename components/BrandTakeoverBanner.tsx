"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

interface Sponsor {
  id: string;
  brandName: string;
  headline: string;
  ctaText: string;
  ctaUrl: string;
  niche: string;
  active: boolean;
}

export default function BrandTakeoverBanner({ niche = "all" }: { niche?: string }) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Default high-value sponsor or fetch from data
    if (niche === "crypto") {
      setSponsor({
        id: "sp-2",
        brandName: "Kraken Institutional",
        headline: "Deep OTC Liquidity & 24/7 Custody for Asset Managers",
        ctaText: "Access Institutional Desk →",
        ctaUrl: "https://kraken.com/institutional",
        niche: "crypto",
        active: true,
      });
    } else if (niche === "finance") {
      setSponsor({
        id: "sp-3",
        brandName: "Carta Equity",
        headline: "Automate Valuations, 409A, and Investor Reporting",
        ctaText: "Founder Demo →",
        ctaUrl: "https://carta.com",
        niche: "finance",
        active: true,
      });
    } else {
      setSponsor({
        id: "sp-1",
        brandName: "NordLayer Security",
        headline: "Zero-Trust Cloud Network Security for Distributed Engineering Teams",
        ctaText: "Deploy in 10 Mins →",
        ctaUrl: "https://nordlayer.com",
        niche: "all",
        active: true,
      });
    }
  }, [niche]);

  if (!sponsor || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#070b14] via-[#0d1627] to-[#070b14] border-b border-blue-900/40 text-xs py-2 px-4 select-none relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> SPONSORED BY
          </span>
          <span className="font-bold text-white tracking-tight">{sponsor.brandName}:</span>
          <span className="text-gray-300 hidden md:inline">{sponsor.headline}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-bold font-mono text-[11px] flex items-center gap-1 transition-colors group"
          >
            <span>{sponsor.ctaText}</span>
          </a>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <Link
            href="/advertise"
            className="text-gray-400 hover:text-white text-[10px] font-mono underline transition-colors hidden sm:inline"
          >
            Advertise Here
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-300 p-0.5 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
