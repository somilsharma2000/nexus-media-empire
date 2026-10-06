"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  Share2, 
  Menu, 
  Bookmark, 
  ChevronRight, 
  Zap, 
  Coins, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CookieConsent from "../../components/CookieConsent";
import ArticleSearch from "../../components/ArticleSearch";
import NewsletterForm from "../../components/NewsletterForm";
import BrandTakeoverBanner from "../../components/BrandTakeoverBanner";
import GodModeWhaleTracker from "../../components/GodModeWhaleTracker";

interface Article { 
  id: number | string; 
  title: string; 
  category?: string; 
  time?: string; 
  excerpt: string; 
  content?: string; 
  image?: string; 
  featured?: boolean; 
  slug?: string; 
  niche?: string; 
  viewCount?: number;
}

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
    <div 
      className="group cursor-pointer border border-amber-900/40 hover:border-amber-500/50 p-6 rounded-3xl bg-[#0a0702] flex flex-col justify-between min-h-[320px] transition-all"
      onClick={() => window.open("/go/ledger-wallet", "_blank")}
    >
      <div>
        <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold mb-3 block">- Security Partner -</span>
        <h4 className="text-xl font-bold text-amber-400 leading-tight mb-2 group-hover:text-amber-300 transition-colors">
          Ledger Nano X Cold Storage
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed">Protect your digital assets with certified CC EAL6+ secure element chips and Bluetooth custody.</p>
      </div>
      <button className="mt-4 border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center">
        Claim Vault Security →
      </button>
    </div>
  );
}

function MidFeedAdCard({ slot }: { slot: AdSlot }) {
  return (
    <div 
      className="group cursor-pointer border border-amber-900/40 hover:border-amber-500/50 p-6 rounded-3xl bg-[#0a0702] flex flex-col justify-between min-h-[320px] transition-all"
      onClick={() => window.open(slot.ctaUrl, "_blank")}
    >
      <div>
        <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold mb-3 block">
          {slot.requiresDisclosure ? "- Sponsored Partner -" : "- Advertisement -"}
        </span>
        <h4 className="text-xl font-bold text-amber-400 leading-tight mb-2 group-hover:text-amber-300 transition-colors">
          {slot.headline}
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed">{slot.description}</p>
      </div>
      <button className="mt-4 border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center">
        Access Offer →
      </button>
    </div>
  );
}

export default function CryptoSite() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [midFeedSlot, setMidFeedSlot] = useState<AdSlot | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleBookmark = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    const strId = String(id);
    let updated: string[];
    if (bookmarkedIds.includes(strId)) {
      updated = bookmarkedIds.filter((item) => item !== strId);
      showToast("Removed from reading list");
    } else {
      updated = [...bookmarkedIds, strId];
      showToast("Saved to reading list 🔖");
    }
    setBookmarkedIds(updated);
    try {
      localStorage.setItem("nexus_crypto_bookmarks", JSON.stringify(updated));
    } catch {}
  };

  const handleShare = (e: React.MouseEvent, title: string, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = window.location.origin + url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      showToast("Link copied to clipboard! 📋");
    } else {
      showToast("Share: " + fullUrl);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        const cryptoItems = data.filter((a: Article) => (a.niche || "").toLowerCase() === "crypto");
        setArticles(cryptoItems.length > 0 ? cryptoItems : data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/adslots");
      if (res.ok) {
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
      }
    } catch {
      setMidFeedSlot(null);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchAds();
    try {
      const saved = localStorage.getItem("nexus_crypto_bookmarks");
      if (saved) setBookmarkedIds(JSON.parse(saved));
    } catch {}
  }, []);

  const categories = ["All", "Bitcoin", "Ethereum", "DeFi", "Custody"];

  const filteredArticles = articles.filter((a) => {
    if (activeCategory === "All") return true;
    const cat = (a.category || a.title || "").toLowerCase();
    if (activeCategory === "Bitcoin") return cat.includes("bitcoin") || cat.includes("btc") || cat.includes("halving");
    if (activeCategory === "Ethereum") return cat.includes("ethereum") || cat.includes("eth") || cat.includes("staking");
    if (activeCategory === "DeFi") return cat.includes("defi") || cat.includes("yield") || cat.includes("dex");
    if (activeCategory === "Custody") return cat.includes("wallet") || cat.includes("ledger") || cat.includes("security");
    return true;
  });

  const heroArticle = filteredArticles.length > 0 ? filteredArticles[0] : articles[0];
  const sidebarArticles = filteredArticles.length > 1 ? filteredArticles.slice(1, 4) : articles.slice(1, 4);
  const feedArticles = filteredArticles.length > 4 ? filteredArticles.slice(4) : articles.slice(4);

  return (
    <div className="min-h-screen bg-[#070503] text-gray-200 font-sans selection:bg-amber-500 selection:text-black pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-amber-400"
          >
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Sponsor Takeover Banner */}
      <BrandTakeoverBanner niche="crypto" />

      {/* Global Navigation Header */}
      <nav className="border-b border-gray-900 bg-[#070503]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6 sm:gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight leading-none block">CRYPTO</span>
                <span className="text-amber-400 font-mono font-bold text-[10px] tracking-widest uppercase">DAILY • ON-CHAIN DISPATCH</span>
              </div>
            </Link>

            {/* Category Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === cat
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <Link 
                href="/advertise" 
                className="px-3 py-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 font-mono text-[11px] transition-colors flex items-center gap-1"
              >
                Advertise <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/advertise" 
              className="hidden sm:inline-flex items-center text-xs font-mono text-gray-300 hover:text-white border border-gray-800 hover:border-amber-500/60 px-3.5 py-2 rounded-xl transition-colors"
            >
              Media Kit
            </Link>
            <button 
              onClick={() => {
                const el = document.getElementById("newsletter-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Subscribe
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white lg:hidden border border-gray-800 rounded-xl focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Category Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-b border-gray-900 bg-[#0c0904] px-6 py-4 space-y-3"
            >
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      activeCategory === cat ? "bg-amber-500 text-black font-bold" : "bg-gray-900 text-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
                <Link href="/advertise" className="text-amber-400">📢 Sponsor Crypto Daily</Link>
                <Link href="/admin/login" className="text-gray-400">Operator Login</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Real-Time Live Search */}
        <ArticleSearch niche="crypto" />

        {/* Live Whale Alert Radar */}
        <GodModeWhaleTracker />

        {/* HERO & SIDEBAR SECTION */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main Hero Card */}
              {heroArticle && (
                <div className="lg:col-span-8 group">
                  <div className="relative rounded-3xl overflow-hidden border border-amber-950/60 bg-[#0d0903] min-h-[460px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
                    <img 
                      src={heroArticle.image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop"} 
                      alt={heroArticle.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    />
                    
                    {/* Top Badges & Actions */}
                    <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
                      <span className="bg-amber-500 text-black text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        {heroArticle.category || "DeFi Intelligence"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleBookmark(e, heroArticle.id)}
                          className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
                          title="Bookmark"
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(String(heroArticle.id)) ? "fill-amber-400 text-amber-400" : "text-white"}`} />
                        </button>
                        <button
                          onClick={(e) => handleShare(e, heroArticle.title, `/crypto/${heroArticle.slug || heroArticle.id}`)}
                          className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Headline & Metadata */}
                    <div className="relative z-20 space-y-3 pt-24">
                      <div className="flex items-center gap-3 text-xs font-mono text-emerald-400 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>E-E-A-T Verified • Protocol Audit</span>
                      </div>
                      <Link href={`/crypto/${heroArticle.slug || heroArticle.id}`} className="block">
                        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight group-hover:text-amber-400 transition-colors">
                          {heroArticle.title}
                        </h2>
                      </Link>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-3xl">
                        {heroArticle.excerpt}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-500" /> 6 min read</span>
                        <Link 
                          href={`/crypto/${heroArticle.slug || heroArticle.id}`}
                          className="text-amber-400 font-bold flex items-center gap-1 hover:text-amber-300"
                        >
                          Read Protocol Analysis <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Sidebar */}
              <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
                
                {/* Programmatic / Sponsor Ad Unit */}
                <div 
                  className="bg-[#0b0803] border border-amber-950/70 rounded-3xl p-6 flex flex-col justify-between cursor-pointer hover:border-amber-500/40 transition-all group"
                  onClick={() => window.open("/go/ledger-wallet", "_blank")}
                >
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold mb-3 block">- Certified Vault -</span>
                    <div className="w-full h-32 bg-[url('https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center rounded-2xl mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      Keystone 3 Pro Air-Gapped Wallet
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Zero USB, zero Bluetooth. 100% optical QR transmission for total seed phrase isolation.
                    </p>
                  </div>
                  <button className="mt-4 bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black w-full py-2 rounded-xl font-bold text-xs transition-colors">
                    Inspect Hardware Specs →
                  </button>
                </div>

                {/* Sidebar Top Trending Dispatches */}
                <div className="bg-[#0b0803] border border-amber-950/70 rounded-3xl p-6 flex-1 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-gray-900">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Trending Protocols
                  </h3>
                  <div className="space-y-4">
                    {sidebarArticles.map((art, idx) => (
                      <Link 
                        key={art.id || idx}
                        href={`/crypto/${art.slug || art.id}`}
                        className="group block space-y-1 pb-3 border-b border-gray-900/80 last:border-b-0"
                      >
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-amber-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> 4 min read
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* FULL ARTICLE FEED */}
            <section className="space-y-6 pt-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-900">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  DeFi & Web3 Vault ({filteredArticles.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedArticles.map((article, idx) => (
                  <React.Fragment key={article.id || idx}>
                    <article className="group flex flex-col justify-between p-6 rounded-3xl bg-[#0a0702] border border-amber-950/60 hover:border-amber-500/40 hover:bg-[#100c05] transition-all shadow-lg relative">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {article.category || "Crypto & Web3"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => toggleBookmark(e, article.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="Bookmark"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(String(article.id)) ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <button
                              onClick={(e) => handleShare(e, article.title, `/crypto/${article.slug || article.id}`)}
                              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="Share"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <Link href={`/crypto/${article.slug || article.id}`} className="block">
                          <h4 className="text-base font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-900 flex items-center justify-between text-xs text-gray-400 font-mono">
                        <span>5 min read</span>
                        <Link 
                          href={`/crypto/${article.slug || article.id}`}
                          className="text-amber-400 group-hover:text-amber-300 font-semibold flex items-center gap-1"
                        >
                          Read <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>

                    {/* Inject dynamic mid-feed ad at 4th position */}
                    {idx === 2 && (
                      midFeedSlot ? <MidFeedAdCard slot={midFeedSlot} /> : <HouseAdCard />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Newsletter Section Anchor */}
        <section id="newsletter-section" className="rounded-3xl border border-amber-950/60 bg-[#0d0903] p-8 sm:p-12 text-center space-y-4">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">Crypto Daily Telegram & Email Wire</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Daily On-Chain Alpha & Staking Signals</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Get whale flow alerts and high-yield security audits delivered every morning at 6:00 AM EST.
            </p>
            <div className="pt-2">
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </section>

      </main>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
