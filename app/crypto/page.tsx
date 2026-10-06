"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, Share2, Menu, Search, Bookmark, ChevronRight, Zap } from "lucide-react";
import CookieConsent from "../../components/CookieConsent";
import ArticleSearch from "../../components/ArticleSearch";
import NewsletterForm from "../../components/NewsletterForm";
import BrandTakeoverBanner from "../../components/BrandTakeoverBanner";
import GodModeLiveTicker from "../../components/GodModeLiveTicker";
import GodModeWhaleTracker from "../../components/GodModeWhaleTracker";



import { motion, AnimatePresence } from "framer-motion";

interface Article { id: number | string; title: string; category: string; time: string; excerpt: string; content?: string; image?: string; featured?: boolean; slug?: string; niche?: string; }

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
    <div className="group cursor-pointer border border-gray-900 hover:border-green-900/50 p-6 rounded-xl bg-[#040c06] flex flex-col gap-3"
      onClick={() => window.open("http://localhost:3003", "_blank")}>
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">- Advertisement -</span>
      <h4 className="text-xl font-bold text-green-400 leading-tight group-hover:text-green-300 transition-colors">
        Upgrade to Nexus Pro
      </h4>
      <p className="text-gray-500 text-sm">Automate your entire content operation.</p>
      <span className="mt-auto text-sm font-bold text-gray-400 flex items-center gap-1 group-hover:text-green-500 transition-colors">
        Learn More <ChevronRight className="w-4 h-4"/>
      </span>
    </div>
  );
}

function MidFeedAdCard({ slot }: { slot: AdSlot }) {
  return (
    <div className="group cursor-pointer border border-gray-900 hover:border-green-900/50 p-6 rounded-xl bg-[#040c06] flex flex-col gap-3"
      onClick={() => window.open(slot.ctaUrl, "_blank")}>
      {slot.requiresDisclosure && (
        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">- Sponsored -</span>
      )}
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">- Advertisement -</span>
      <h4 className="text-xl font-bold text-green-400 leading-tight group-hover:text-green-300 transition-colors">
        {slot.headline}
      </h4>
      <p className="text-gray-500 text-sm">{slot.description}</p>
      <span className="mt-auto text-sm font-bold text-gray-400 flex items-center gap-1 group-hover:text-green-500 transition-colors">
        Learn More <ChevronRight className="w-4 h-4"/>
      </span>
    </div>
  );
}

export default function CryptoSite() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [midFeedSlot, setMidFeedSlot] = useState<AdSlot | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      // Filter ONLY Crypto articles (or fallback if none exist to show the engine works)
      const cryptoNews = data.filter((a: Article) => {
        const cat = (a.category || a.niche || "").toLowerCase();
        return cat.includes('crypto') || cat.includes('bitcoin') || cat.includes('solana') || cat.includes('defi');
      });
      setArticles(cryptoNews.length > 0 ? cryptoNews : data); 
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
        (s) => s.isActive && (s.siteTargeting === "all" || s.siteTargeting === "crypto") && s.placement === "midFeed"
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

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const feedArticles = articles.length > 1 ? articles.slice(1) : [];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020804] text-gray-200 font-sans selection:bg-green-500/30">
      
      {/* Global Network Switcher */}
      <div className="bg-black border-b border-gray-900 text-xs text-gray-500 py-2 px-6 flex justify-between items-center font-mono">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase tracking-widest text-[10px]">Nexus Empire:</span>
          <a href="/news" className="cursor-pointer hover:text-white transition-colors">Tech Matrix</a>
          <span className="text-green-500 font-bold cursor-pointer border-b border-green-500">Crypto Daily</span>
          <a href="/finance" className="cursor-pointer hover:text-white transition-colors">Wall St Insider</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> Backend 3002 Sync</span>
        </div>
      </div>

      {/* Live God-Mode Crypto Ticker */}
      <GodModeLiveTicker niche="crypto" />

      {/* Brand Sponsor Takeover Banner */}
      <BrandTakeoverBanner niche="crypto" />

      <nav className="border-b border-green-900/30 bg-[#020804]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-black text-black text-xl shadow-lg shadow-green-500/20">
                ₿
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter leading-none">CRYPTO DAILY</h1>
                <span className="text-green-500 font-bold text-[10px] tracking-widest uppercase">Decentralized Intelligence</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
              <a href="/advertise" className="text-green-400 hover:text-green-300 font-bold">Advertise</a>
              <a href="/advertise/portal" className="hover:text-white">Proof Portal</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/advertise" className="hidden sm:block text-xs font-mono text-gray-400 hover:text-white border border-gray-800 px-3 py-1.5 rounded-full hover:border-green-500/40 transition-colors">
              Media Kit
            </a>
            <button className="hidden sm:block bg-green-500 text-black px-5 py-2 rounded-full font-black text-xs hover:bg-green-400 transition-colors uppercase tracking-wider shadow-sm">Connect Wallet</button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white md:hidden border border-gray-800 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-6 h-6 text-green-400" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-green-900/40 bg-[#040e07] px-6 py-6 space-y-4 font-mono text-sm"
            >
              <div className="flex flex-col space-y-3 font-semibold">
                <a href="/advertise" className="text-green-400 hover:text-green-300 py-1">📢 Sponsor Crypto Daily ($3,500/mo)</a>
                <a href="/advertise/portal" className="text-gray-300 hover:text-white py-1">🛡️ Real-Time Proof Portal</a>
                <a href="/news" className="text-gray-300 hover:text-white py-1">🌐 Tech Matrix News</a>
                <a href="/finance" className="text-gray-300 hover:text-white py-1">📈 Wall St Insider</a>
              </div>
              <div className="pt-4 border-t border-green-900/30">
                <button className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors text-center">
                  Connect Web3 Wallet
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>


      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            <ArticleSearch niche="crypto" />

            {heroArticle && (
              <a href={`/crypto/${heroArticle.slug || heroArticle.id}`} className="mb-16 border border-green-900/30 rounded-2xl overflow-hidden bg-gray-900/20 group cursor-pointer block">
                <div className="relative h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020804] to-transparent z-10"></div>
                  <img 
                    src={heroArticle.image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop'} 
                    alt={heroArticle.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" 
                  />
                  <div className="absolute bottom-0 left-0 w-full p-10 z-20">
                    <span className="text-green-500 font-mono text-xs font-bold tracking-widest uppercase mb-4 block">{heroArticle.category}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 group-hover:text-green-400 transition-colors">
                      {heroArticle.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl font-mono">{heroArticle.excerpt}</p>
                  </div>
                </div>
              </a>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {feedArticles.map((article) => (
                <a key={article.id} href={`/crypto/${article.slug || article.id}`} className="group cursor-pointer flex flex-col border border-gray-900 hover:border-green-900/50 p-6 rounded-xl transition-colors bg-[#040c06]">
                  {article.image && (
                    <div className="h-40 rounded-lg overflow-hidden mb-4 border border-gray-900">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="text-xs font-mono text-green-500 mb-3">{article.category} // {article.time}</span>
                  <h4 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-green-400 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4">{article.excerpt}</p>
                  <span className="mt-auto text-sm font-bold text-gray-400 flex items-center gap-1 group-hover:text-green-500 transition-colors">Read Report <ChevronRight className="w-4 h-4"/></span>
                </a>
              ))}

              {/* Mid-feed Ad — dynamic or house fallback */}
              {midFeedSlot ? <MidFeedAdCard slot={midFeedSlot} /> : <HouseAdCard />}
            </div>

            {/* Live On-Chain Whale & Smart Money Radar */}
            <GodModeWhaleTracker />

            <NewsletterForm niche="crypto" variant="inline" />

          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-900/30 bg-[#020804] py-10 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>CRYPTO DAILY &copy; 2026 • Decentralized Market Intelligence</div>
          <div className="flex flex-wrap gap-6 font-mono text-[11px]">
            <a href="/advertise" className="text-green-400 hover:text-green-300 font-bold">Advertise</a>
            <a href="/privacy" className="hover:text-green-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-green-400">Terms of Service</a>
            <a href="/disclosures" className="hover:text-green-400">FTC Disclosures</a>
            <a href="/advertise/terms" className="hover:text-green-400">Ad Agreement</a>
          </div>

        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
