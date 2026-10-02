"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, BarChart2 } from "lucide-react";
import CookieConsent from "../../components/CookieConsent";

interface Article { id: number; title: string; category: string; time: string; excerpt: string; content?: string; image?: string; featured?: boolean; }

interface AdSlot {
  id: string;
  name: string;
  siteTargeting: string;
  placement: string;
  type: string;
  headline: string;
  description: string;
  ctaUrl: string;
  weight: number;
  isActive: boolean;
  requiresDisclosure: boolean;
  priority: number;
  frequencyCapPerUser: number;
}

/** Weighted random pick */
function pickByWeight(slots: AdSlot[]): AdSlot | null {
  if (!slots.length) return null;
  const total = slots.reduce((s, slot) => s + slot.weight, 0);
  let rand = Math.random() * total;
  for (const slot of slots) {
    rand -= slot.weight;
    if (rand <= 0) return slot;
  }
  return slots[slots.length - 1];
}

function checkFrequencyCap(slot: AdSlot): boolean {
  if (slot.frequencyCapPerUser <= 0) return true;
  const key = `nexus_ad_shown_${slot.id}`;
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  if (count >= slot.frequencyCapPerUser) return false;
  localStorage.setItem(key, String(count + 1));
  return true;
}

function HouseAdCard() {
  return (
    <div className="group cursor-pointer border-b border-gray-200 pb-10 flex flex-col gap-3"
      onClick={() => window.open("http://localhost:3003", "_blank")}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-1">Sponsored</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 leading-tight group-hover:text-amber-700 transition-colors">
        Upgrade to Nexus Pro
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed font-serif">Automate your entire content operation.</p>
      <span className="text-sm font-bold font-sans text-gray-900 flex items-center gap-1 uppercase tracking-wider group-hover:text-amber-700">
        Learn More <ChevronRight className="w-4 h-4"/>
      </span>
    </div>
  );
}

function MidFeedAdCard({ slot }: { slot: AdSlot }) {
  return (
    <div className="group cursor-pointer border-b border-gray-200 pb-10 flex flex-col gap-3"
      onClick={() => window.open(slot.ctaUrl, "_blank")}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-1">
          {slot.requiresDisclosure ? "Sponsored" : "Advertisement"}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 leading-tight group-hover:text-amber-700 transition-colors">
        {slot.headline}
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed font-serif">{slot.description}</p>
      <span className="text-sm font-bold font-sans text-gray-900 flex items-center gap-1 uppercase tracking-wider group-hover:text-amber-700">
        Learn More <ChevronRight className="w-4 h-4"/>
      </span>
    </div>
  );
}

export default function FinanceSite() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [midFeedSlot, setMidFeedSlot] = useState<AdSlot | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      const financeNews = data.filter((a: Article) => a.category.toLowerCase().includes('finance') || a.category.toLowerCase().includes('market'));
      setArticles(financeNews.length > 0 ? financeNews : data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/adslots');
      const slots: AdSlot[] = await res.json();
      const eligible = slots.filter(
        (s) => s.isActive && (s.siteTargeting === "all" || s.siteTargeting === "finance") && s.placement === "midFeed"
      );
      const picked = pickByWeight(eligible);
      if (picked && checkFrequencyCap(picked)) {
        setMidFeedSlot(picked);
      } else {
        setMidFeedSlot(null);
      }
    } catch {
      setMidFeedSlot(null);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchAds();
    const interval = setInterval(fetchArticles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-serif selection:bg-amber-500/30">
      
      {/* Global Network Switcher */}
      <div className="bg-gray-900 text-xs text-gray-400 py-1.5 px-6 flex justify-between items-center font-sans">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase tracking-widest text-[10px]">Nexus Empire:</span>
          <a href="/news" className="cursor-pointer hover:text-white transition-colors">Tech Matrix</a>
          <a href="/crypto" className="cursor-pointer hover:text-white transition-colors">Crypto Daily</a>
          <span className="text-amber-500 font-bold cursor-pointer border-b border-amber-500">Wall St Insider</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-amber-500 font-bold"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div> Backend Sync Live</span>
        </div>
      </div>

      <header className="border-b-4 border-gray-900 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase font-sans">Wall St <span className="text-amber-600">Insider</span></h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-sans font-bold mt-1">Markets. Economy. Wealth.</p>
          </div>
          <button className="border-2 border-gray-900 px-6 py-2 font-bold font-sans hover:bg-gray-900 hover:text-white transition-colors uppercase text-sm">Subscribe for $1</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Main Feed */}
            <div className="md:w-2/3 flex flex-col gap-10">
              {articles.map((article, i) => (
                <div key={article.id} className={`flex flex-col cursor-pointer group ${i !== articles.length -1 ? 'border-b border-gray-200 pb-10' : ''}`} onClick={() => alert("Simulated Article")}>
                  <div className="flex items-center gap-3 mb-3 font-sans">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-1">{article.category}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">{article.time}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-amber-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4 font-serif">
                    {article.excerpt}
                  </p>
                  <span className="text-sm font-bold font-sans text-gray-900 flex items-center gap-1 uppercase tracking-wider group-hover:text-amber-700">Continue Reading <ChevronRight className="w-4 h-4"/></span>
                </div>
              ))}

              {/* Mid-feed Ad — dynamic or house fallback */}
              {midFeedSlot ? <MidFeedAdCard slot={midFeedSlot} /> : <HouseAdCard />}
            </div>

            {/* Sidebar Data */}
            <div className="md:w-1/3">
              <div className="bg-gray-100 p-6 border-t-4 border-amber-600">
                <h3 className="font-black font-sans uppercase text-gray-900 mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5"/> Market Indices</h3>
                <div className="flex flex-col gap-4 font-sans font-bold">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3"><span>S&P 500</span><span className="text-green-600">+1.24%</span></div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3"><span>DOW JONES</span><span className="text-green-600">+0.89%</span></div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3"><span>NASDAQ</span><span className="text-green-600">+1.75%</span></div>
                  <div className="flex justify-between items-center pb-1"><span>VIX</span><span className="text-red-600">-4.20%</span></div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
