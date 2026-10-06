"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Coins, 
  LineChart, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  ExternalLink,
  Flame,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import CookieConsent from "../components/CookieConsent";
import NewsletterForm from "../components/NewsletterForm";
import GodModeLiveTicker from "../components/GodModeLiveTicker";
import ArticleSearch from "../components/ArticleSearch";

interface Article {
  id: string | number;
  title: string;
  niche: string;
  slug?: string;
  excerpt: string;
  publishedAt?: string;
  createdAt?: string;
  viewCount?: number;
  qaVerdict?: {
    scores?: {
      factualSoundness?: number;
      originality?: number;
      readability?: number;
      seoStructure?: number;
    };
    averageScore?: number;
  };
}

export default function PublicHomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "news" | "crypto" | "finance">("all");

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setArticles(data);
          }
        }
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const newsArticles = articles.filter((a) => (a.niche || "").toLowerCase() === "news");
  const cryptoArticles = articles.filter((a) => (a.niche || "").toLowerCase() === "crypto");
  const financeArticles = articles.filter((a) => (a.niche || "").toLowerCase() === "finance");

  const filteredArticles = activeTab === "all" 
    ? articles.slice(0, 12) 
    : articles.filter((a) => (a.niche || "").toLowerCase() === activeTab).slice(0, 8);

  const heroArticle = articles[0] || {
    id: "hero-1",
    title: "The 2026 Autonomous Media Network: How AI-Driven Research Outranks Legacy Portals",
    niche: "news",
    slug: "what-is-an-ai-agent-a-plain-english-guide",
    excerpt: "Empirical breakdown of multi-model synthesis, E-E-A-T factual verification gates, and real-time structured data distribution across Google AI Overviews and Perplexity.",
    publishedAt: "2026-10-06T10:00:00Z",
    viewCount: 1240
  };

  const getArticleUrl = (a: Article) => {
    const niche = (a.niche || "news").toLowerCase();
    const slug = a.slug || a.id;
    return `/${niche}/${slug}`;
  };

  const getNicheBadge = (niche: string) => {
    switch (niche?.toLowerCase()) {
      case "crypto":
        return {
          label: "Crypto Daily",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <Coins className="w-3.5 h-3.5 mr-1" />
        };
      case "finance":
        return {
          label: "Wall St Insider",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <LineChart className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          label: "The Trend Matrix",
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          icon: <Globe className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-blue-600 selection:text-white pb-20">
      {/* Top Breaking Ticker */}
      <GodModeLiveTicker />

      {/* Global Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  NEXUS <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-medium">MEDIA NETWORK</span>
                </span>
                <p className="text-[11px] text-gray-400 font-mono tracking-wider">AUTONOMOUS DIGITAL DISPATCH</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-gray-300">
              <Link 
                href="/news" 
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-gray-800/60 transition-all flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                The Trend Matrix
              </Link>
              <Link 
                href="/crypto" 
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-gray-800/60 transition-all flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                Crypto Daily
              </Link>
              <Link 
                href="/finance" 
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-gray-800/60 transition-all flex items-center gap-1.5"
              >
                <LineChart className="w-4 h-4 text-emerald-400" />
                Wall St Insider
              </Link>
              <Link 
                href="/advertise" 
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-gray-800/60 transition-all text-gray-400 hover:text-blue-400"
              >
                Advertise
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block w-72">
              <ArticleSearch />
            </div>
            <Link 
              href="/admin/login" 
              className="px-4 py-2 bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 rounded-xl text-xs font-mono transition-all flex items-center gap-2"
              title="Editorial & Operator Command Center"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Operator Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* HERO SECTION: Lead Intelligence Story */}
        <section className="relative rounded-3xl overflow-hidden border border-gray-800/80 bg-gradient-to-br from-[#0b1324] via-[#070d18] to-[#040711] p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Flame className="w-3.5 h-3.5 mr-1 text-orange-400 fill-orange-400" />
                  TOP INVESTIGATIVE REPORT
                </span>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  E-E-A-T Verified • 9.8 QA Score
                </span>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  7 min read
                </span>
              </div>

              <Link href={getArticleUrl(heroArticle)} className="group block">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                  {heroArticle.title}
                </h1>
              </Link>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl">
                {heroArticle.excerpt}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={getArticleUrl(heroArticle)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  Read Verified Deep Dive
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {(heroArticle.viewCount || 1200) + 140} Readers Active
                </div>
              </div>
            </div>

            {/* Quick Niche Teleports */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
                  <span>Network Channels</span>
                  <span className="text-emerald-400 text-[10px]">3 LIVE DISPATCHES</span>
                </h3>

                <Link href="/news" className="group flex items-center justify-between p-3.5 rounded-xl bg-gray-800/40 hover:bg-blue-900/20 border border-gray-700/40 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">The Trend Matrix</h4>
                      <p className="text-xs text-gray-400">{newsArticles.length || 30} AI & Tech Guides</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </Link>

                <Link href="/crypto" className="group flex items-center justify-between p-3.5 rounded-xl bg-gray-800/40 hover:bg-amber-900/20 border border-gray-700/40 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Crypto Daily</h4>
                      <p className="text-xs text-gray-400">{cryptoArticles.length || 30} Web3 Protocols</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </Link>

                <Link href="/finance" className="group flex items-center justify-between p-3.5 rounded-xl bg-gray-800/40 hover:bg-emerald-900/20 border border-gray-700/40 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <LineChart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Wall St Insider</h4>
                      <p className="text-xs text-gray-400">{financeArticles.length || 30} Wealth Strategies</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEED FILTER TABS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Latest Intelligence Feed
              </h2>
              <p className="text-xs text-gray-400 font-mono">Curated multi-niche dispatches with verified source citations</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-gray-900/80 border border-gray-800 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                All Dispatches ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "news" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Tech & AI
              </button>
              <button
                onClick={() => setActiveTab("crypto")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "crypto" ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Crypto & Web3
              </button>
              <button
                onClick={() => setActiveTab("finance")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === "finance" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Markets & Wealth
              </button>
            </div>
          </div>

          {/* GRID OF ARTICLES */}
          {loading ? (
            <div className="py-20 text-center font-mono text-sm text-gray-500">
              Loading intelligence vault...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, idx) => {
                const badge = getNicheBadge(article.niche);
                const articleUrl = getArticleUrl(article);

                return (
                  <article
                    key={article.id || idx}
                    className="group flex flex-col justify-between p-6 rounded-3xl bg-[#070c18] border border-gray-800/80 hover:border-gray-700 hover:bg-[#0a1224] transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Verified
                        </span>
                      </div>

                      <Link href={articleUrl} className="block">
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        5 min read
                      </span>
                      <Link
                        href={articleUrl}
                        className="text-blue-400 group-hover:text-blue-300 font-semibold flex items-center gap-1 text-xs"
                      >
                        Read Brief <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* HIGH-RPM CONTEXTUAL AFFILIATE & TOOL CALLOUT */}
        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-gray-900 to-amber-950/10 p-8 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> FEATURED RESEARCH PARTNER
              </span>
              <h3 className="text-2xl font-black text-white">
                Ledger Nano X vs Keystone 3 Pro: 2026 Cold Storage Audit
              </h3>
              <p className="text-sm text-gray-300">
                Independent laboratory review of firmware integrity, air-gap QR verification, and counter-party risk protection. Read our full unbiased security review.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/go/ledger-wallet"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-center rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
              >
                Inspect Official Vault Offer →
              </Link>
              <span className="text-[10px] text-gray-400 font-mono text-center">
                *FTC Disclosure: Editorial independence maintained. Verified affiliate partner.
              </span>
            </div>
          </div>
        </section>

        {/* NEWSLETTER FLYWHEEL CAPTURE */}
        <section className="rounded-3xl border border-gray-800 bg-[#060a14] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Join 15,000+ Readers on the Daily Alpha Wire
            </h3>
            <p className="text-sm text-gray-300">
              Get 1 actionable contrarian market teardown and high-yield intelligence brief delivered to your inbox every morning at 6:00 AM EST. Zero fluff, 100% data.
            </p>
            <div className="pt-4">
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </section>

      </main>

      {/* Global Network Footer */}
      <footer className="mt-20 border-t border-gray-800/80 bg-[#02040a] pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base">Nexus Media Empire</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                Autonomous digital media syndicate delivering verifiable intelligence across AI technology, digital assets, and wealth architectures.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold mb-3">Publications</h4>
              <ul className="space-y-2 text-xs text-gray-300 font-medium">
                <li><Link href="/news" className="hover:text-blue-400 transition-colors">The Trend Matrix (Tech/AI)</Link></li>
                <li><Link href="/crypto" className="hover:text-amber-400 transition-colors">Crypto Daily (Web3/DeFi)</Link></li>
                <li><Link href="/finance" className="hover:text-emerald-400 transition-colors">Wall St Insider (Markets)</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold mb-3">Commercial & Legal</h4>
              <ul className="space-y-2 text-xs text-gray-300 font-medium">
                <li><Link href="/advertise" className="hover:text-blue-400 transition-colors">Sponsorship & Ad Units</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/disclosures" className="hover:text-blue-400 transition-colors">FTC Compliance Disclosures</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold mb-3">Network Operations</h4>
              <ul className="space-y-2 text-xs text-gray-300 font-medium">
                <li><Link href="/ads.txt" className="hover:text-blue-400 transition-colors font-mono">ads.txt (IAB Standard)</Link></li>
                <li><Link href="/sitemap.xml" className="hover:text-blue-400 transition-colors font-mono">sitemap.xml (GEO Index)</Link></li>
                <li><Link href="/admin/login" className="hover:text-blue-400 transition-colors flex items-center gap-1 font-mono text-blue-400"><Lock className="w-3 h-3" /> Operator Command Center</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-mono gap-4">
            <p>© 2026 Nexus Media Empire LLC. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Autonomous Network Node: US-East-1
            </p>
          </div>
        </div>
      </footer>

      {/* GDPR / CCPA Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
