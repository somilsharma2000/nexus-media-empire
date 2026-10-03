"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, ArrowRight, Share2, Menu, Search, Bookmark, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CookieConsent from "../../components/CookieConsent";
import ArticleSearch from "../../components/ArticleSearch";
import NewsletterForm from "../../components/NewsletterForm";

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

/** Weighted random pick from array of slots */
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

/** Check + update frequency cap using localStorage */
function checkFrequencyCap(slot: AdSlot): boolean {
  if (slot.frequencyCapPerUser <= 0) return true; // no cap
  const key = `nexus_ad_shown_${slot.id}`;
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  if (count >= slot.frequencyCapPerUser) return false;
  localStorage.setItem(key, String(count + 1));
  return true;
}

/** House ad fallback card */
function HouseAdCard() {
  return (
    <div className="group cursor-pointer flex flex-col border border-gray-800 bg-gray-900/30 p-6 rounded-2xl h-[330px]"
      onClick={() => window.open("http://localhost:3003", "_blank")}>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">- Advertisement -</span>
      <h4 className="text-xl font-bold text-blue-400 leading-tight mb-2 group-hover:text-blue-300 transition-colors">
        Upgrade to Nexus Pro
      </h4>
      <p className="text-gray-400 text-sm mb-4">Automate your entire content operation.</p>
      <button className="mt-auto border border-blue-500/50 text-blue-400 hover:bg-blue-900/20 py-2 rounded-lg text-sm font-bold transition-colors">
        Learn More →
      </button>
    </div>
  );
}

/** Dynamic mid-feed ad card */
function MidFeedAdCard({ slot }: { slot: AdSlot }) {
  return (
    <div className="group cursor-pointer flex flex-col border border-gray-800 bg-gray-900/30 p-6 rounded-2xl h-[330px]"
      onClick={() => window.open(slot.ctaUrl, "_blank")}>
      {slot.requiresDisclosure && (
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">- Sponsored -</span>
      )}
      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">- Advertisement -</span>
      <h4 className="text-xl font-bold text-blue-400 leading-tight mb-2 group-hover:text-blue-300 transition-colors">
        {slot.headline}
      </h4>
      <p className="text-gray-400 text-sm mb-4">{slot.description}</p>
      <button className="mt-auto border border-blue-500/50 text-blue-400 hover:bg-blue-900/20 py-2 rounded-lg text-sm font-bold transition-colors">
        Learn More →
      </button>
    </div>
  );
}

export default function PublicNewsSite() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [midFeedSlot, setMidFeedSlot] = useState<AdSlot | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
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

      // Filter: active, matching site (all or news), midFeed placement
      const eligible = slots.filter(
        (s) => s.isActive && (s.siteTargeting === "all" || s.siteTargeting === "news") && s.placement === "midFeed"
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
  const sidebarArticles = articles.length > 1 ? articles.slice(1, 4) : [];
  const feedArticles = articles.length > 4 ? articles.slice(4) : [];

  // Generate GEO/SEO JSON-LD Schema for AI Crawlers
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    'name': 'The Trend Matrix',
    'url': 'https://thetrendmatrix.com',
    'mainEntityOfPage': {
      '@type': 'CollectionPage',
      '@id': 'https://thetrendmatrix.com/news'
    },
    'description': 'AI-driven technology and market analysis.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Nexus Media Empire'
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30">
      
      {/* GEO/SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      
      {/* Breaking News Ticker */}
      <div className="bg-blue-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 flex items-center overflow-hidden whitespace-nowrap">
        <span className="bg-black text-blue-400 px-2 py-0.5 rounded mr-4 z-10 flex items-center gap-1"><Zap className="w-3 h-3"/> BREAKING</span>
        <div className="animate-marquee inline-block">
          {articles.map((a, i) => (
            <span key={i} className="mx-4">{a.title} &bull;</span>
          ))}
          <span className="mx-4">Bitcoin surges past $120k mark &bull;</span>
          <span className="mx-4">EU drafts new AI regulation framework &bull;</span>
        </div>
      </div>

      {/* Premium Navbar */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform rotate-12">
                <div className="w-4 h-4 bg-white transform -rotate-12"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter leading-none">THE TREND</h1>
                <span className="text-blue-500 font-bold text-xs tracking-widest uppercase">Matrix</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-400 ml-8">
              <span className="text-white hover:text-blue-400 cursor-pointer transition-colors">Technology</span>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">AI &amp; Future</span>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">Markets</span>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">Startups</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Bookmark className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <button className="hidden md:block bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">Subscribe</button>
            <Menu className="w-6 h-6 text-white md:hidden cursor-pointer" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            {/* Real-Time Search */}
            <ArticleSearch niche="news" />

            {/* HERO & SIDEBAR SECTION */}
            <div className="flex flex-col lg:flex-row gap-8 mb-16">
              
              {/* Main Hero */}
              {heroArticle && (
                <a 
                  className="lg:w-2/3 cursor-pointer group block"
                  href={`/news/${heroArticle.slug || heroArticle.id}`}
                >
                  <div className="relative h-[500px] rounded-2xl overflow-hidden mb-6">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10"></div>
                    <img 
                      src={heroArticle.image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop'} 
                      alt={heroArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Category Tag */}
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {heroArticle.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                      <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors">
                        {heroArticle.title}
                      </h2>
                      <p className="text-gray-300 text-lg mb-4 line-clamp-2 max-w-3xl">
                        {heroArticle.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {heroArticle.time}</span>
                        <span className="flex items-center gap-1 text-blue-400"><TrendingUp className="w-4 h-4"/> Trending</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* Right Sidebar */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                
                {/* Simulated Programmatic Ad Slot */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-700 transition-colors group" onClick={() => window.open('https://thetrendmatrix.com', '_blank')}>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">- Advertisement -</span>
                  <div className="w-full h-40 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                  <h4 className="text-white font-bold mb-2">The AI Trading Bot Making Millionaires</h4>
                  <p className="text-sm text-gray-400 mb-4">See how algorithms are changing retail investing.</p>
                  <button className="bg-blue-600/20 text-blue-400 w-full py-2 rounded font-bold text-sm">Learn More</button>
                </div>

                {/* Sidebar Articles */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex-1">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500"/> Top Stories
                  </h3>
                  <div className="flex flex-col gap-6">
                    {sidebarArticles.map((article, idx) => (
                      <a key={article.id} href={`/news/${article.slug || article.id}`} className="group cursor-pointer flex gap-4">
                        <div className="text-3xl font-black text-gray-800 group-hover:text-blue-900 transition-colors">0{idx + 1}</div>
                        <div>
                          <h4 className="text-white font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{article.category} &bull; {article.time}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* FEED SECTION */}
            {feedArticles.length > 0 && (
              <div className="mt-8 border-t border-gray-900 pt-12">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-white">Latest from The Matrix</h3>
                  <span className="text-sm font-bold text-blue-400 cursor-pointer flex items-center gap-1 hover:text-blue-300">View All <ChevronRight className="w-4 h-4"/></span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {feedArticles.map((article) => (
                    <a key={article.id} href={`/news/${article.slug || article.id}`} className="group cursor-pointer flex flex-col">
                      <div className="w-full h-48 rounded-2xl mb-4 border border-gray-800 relative overflow-hidden bg-gray-950">
                        <img 
                          src={article.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop'} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                          {article.category}
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-auto">{article.time}</span>
                    </a>
                  ))}

                  {/* Mid-feed Advertisement — dynamic slot or house fallback */}
                  {midFeedSlot ? <MidFeedAdCard slot={midFeedSlot} /> : <HouseAdCard />}
                </div>

                {/* Newsletter Subscribe */}
                <NewsletterForm niche="news" variant="inline" />
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded transform rotate-12 flex items-center justify-center">
              <div className="w-2 h-2 bg-white transform -rotate-12"></div>
            </div>
            <span className="text-white">THE TREND MATRIX</span> &copy; 2026
          </div>
          <div className="flex gap-6">
            <a href="/news/about" className="hover:text-white transition-colors">About</a>
            <a href="/news/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/news/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/news/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
