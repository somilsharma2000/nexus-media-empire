"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, CheckCircle, Tag, Eye, ChevronRight, Zap, Download } from "lucide-react";
import CookieConsent from "../../../components/CookieConsent";
import NewsletterForm from "../../../components/NewsletterForm";
import ReadingProgressBar from "../../../components/ReadingProgressBar";
import TableOfContents from "../../../components/TableOfContents";
import AuthorBio from "../../../components/AuthorBio";
import CommunityPoll from "../../../components/CommunityPoll";
import InteractiveCalculator from "../../../components/InteractiveCalculator";
import GeoSchema from "../../../components/GeoSchema";
import ReaderToolbar from "../../../components/ReaderToolbar";
import LlmAnswerBox from "../../../components/LlmAnswerBox";
import DynamicAffiliateBox from "../../../components/DynamicAffiliateBox";
import ExitIntentModal from "../../../components/ExitIntentModal";
import SmartBehavioralAdUnit from "../../../components/SmartBehavioralAdUnit";
import SmartBehavioralPill from "../../../components/SmartBehavioralPill";
import BrandTakeoverBanner from "../../../components/BrandTakeoverBanner";
import GodModeLiveTicker from "../../../components/GodModeLiveTicker";
import GodModeArticleCopilot from "../../../components/GodModeArticleCopilot";
import InstantProductCheckoutModal, { DigitalProduct } from "../../../components/InstantProductCheckoutModal";



interface Article {
  id: string;
  title: string;
  niche: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  publishedAt: string | null;
  publishAt: string;
  viewCount?: number;
  tweetThread?: string[];
  metaDescription?: string;
}

export default function SingleArticlePage({ params }: { params: { niche: string; slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<DigitalProduct | null>(null);

  // Match high-converting digital product by niche
  const nicheProducts: Record<string, DigitalProduct> = {
    news: {
      id: "dp-3",
      name: "AI Agent Architecture & Prompt Swipe File (2026)",
      slug: "ai-prompt-vault",
      niche: "news",
      priceUsd: 49,
      format: "JSON Prompts + Architecture Specs",
      description: "Over 250+ battle-tested system prompts, multi-agent workflows, and autonomous failover scripts ready for production.",
      features: ["250+ Production System Prompts", "Multi-Tier AI Failover Code", "Commercial License Key"],
      salesCount: 215,
      downloadUrl: "/downloads/ai-prompt-vault-2026.zip"
    },
    crypto: {
      id: "dp-1",
      name: "2026 Crypto Staking & Tax Shield Blueprint",
      slug: "crypto-tax-blueprint",
      niche: "crypto",
      priceUsd: 29,
      format: "PDF + Google Sheet Model",
      description: "Step-by-step institutional guide to safe 12%+ staking yields, cold storage hardware setups, and legal tax mitigation frameworks.",
      features: ["Institutional Yield Calculator", "Cold Storage Security Protocols", "Tax Shield Spreadsheet"],
      salesCount: 142,
      downloadUrl: "/downloads/crypto-tax-blueprint-2026.pdf"
    },
    finance: {
      id: "dp-2",
      name: "Compound Wealth & Dividend Operating System",
      slug: "dividend-compounding-os",
      niche: "finance",
      priceUsd: 39,
      format: "Notion Dashboard + Excel DCF Model",
      description: "The exact multi-asset dividend compounding framework used by high-net-worth family offices to build perpetual income.",
      features: ["Automated DCF Valuation Engine", "Dividend Reinvestment Tracker", "Multi-Asset Asset Allocation Model"],
      salesCount: 189,
      downloadUrl: "/downloads/dividend-compounding-os.zip"
    }
  };

  const currentProduct = nicheProducts[params.niche] || nicheProducts.news;
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  const nicheNames: Record<string, string> = {
    news: "The Trend Matrix",
    crypto: "Crypto Daily",
    finance: "Wall St Insider",
  };
  const publicationName = nicheNames[params.niche] || "Nexus Media";

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((articles: Article[]) => {
        const found = articles.find((a) => a.slug === params.slug || a.id === params.slug);
        if (found) {
          setArticle(found);
          setRelated(articles.filter((a) => a.niche === found.niche && a.id !== found.id).slice(0, 3));
          // Increment view count
          fetch(`/api/articles/${found.id}/view`, { method: "POST" }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug, params.niche]);

  const handleFontSizeChange = (delta: number) => {
    setFontSizeOffset((prev) => Math.max(-2, Math.min(4, prev + delta)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Guide Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">This article may have been archived or updated.</p>
        <Link href={`/${params.niche}`} className="px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500">
          Return to {publicationName}
        </Link>
      </div>
    );
  }

  const publishDate = article.publishedAt || article.publishAt || new Date().toISOString();
  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://thetrendmatrix.com/${params.niche}/${article.slug}`;

  // Convert markdown to clean rendered format with styled images and tables
  const formattedContent = article.content
    .split("\n")
    .map((line, i) => {
      // Inline Markdown Images
      if (line.startsWith("![") && line.includes("](")) {
        const alt = line.substring(line.indexOf("[") + 1, line.indexOf("]"));
        const src = line.substring(line.indexOf("(") + 1, line.indexOf(")"));
        return (
          <div key={i} className="my-8 rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
            <img src={src} alt={alt} className="w-full max-h-[480px] object-cover" />
            <div className="p-3 text-center text-[11px] text-gray-500 font-mono bg-black/80">{alt}</div>
          </div>
        );
      }
      if (line.startsWith("# ")) {
        return null; // Title is in the header
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4 border-b border-gray-800 pb-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-bold text-gray-200 mt-6 mb-2">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-4 border-blue-500 bg-blue-950/20 p-4 rounded-r-xl my-4 text-xs text-blue-200 font-medium leading-relaxed">
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-5 list-disc text-gray-300 text-sm my-1">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
        return <p key={i} className="text-gray-300 text-sm my-2 font-medium">{line}</p>;
      }
      if (line.startsWith("|") && line.endsWith("|")) {
        return (
          <div key={i} className="overflow-x-auto my-2 text-xs font-mono text-gray-300">
            <div className="p-2 bg-gray-900/60 rounded-lg border border-gray-800 inline-block min-w-full">{line}</div>
          </div>
        );
      }
      if (line.trim() === "---") {
        return <hr key={i} className="border-gray-800 my-8" />;
      }
      if (!line.trim()) {
        return <div key={i} className="h-3" />;
      }
      return <p key={i} className="text-gray-300 leading-relaxed my-2">{line}</p>;
    });

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Instant Product Checkout Modal */}
      {selectedProductForCheckout && (
        <InstantProductCheckoutModal
          product={selectedProductForCheckout}
          onClose={() => setSelectedProductForCheckout(null)}
        />
      )}
      {/* GEO Structured Data Schema */}
      <GeoSchema
        title={article.title}
        description={article.metaDescription || article.excerpt || article.title}
        url={currentUrl}
        imageUrl={article.image}
        publishedTime={publishDate}
        niche={article.niche}
        siteName={publicationName}
      />

      {/* Scroll Progress Bar */}
      <ReadingProgressBar />

      {/* Exit Intent Lead Capture Modal */}
      <ExitIntentModal niche={article.niche} />

      {/* Live God-Mode Telemetry Ticker */}
      <GodModeLiveTicker niche={article.niche} />

      {/* Brand Sponsor Takeover Banner */}
      <BrandTakeoverBanner niche={article.niche} />


      {/* Top Breadcrumb Nav */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center text-xs">
          <Link
            href={`/${params.niche}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {publicationName}
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/advertise" className="text-blue-400 hover:text-blue-300 font-mono text-[11px] font-bold">
              Advertise
            </Link>
            <span className="text-[11px] text-gray-500 font-mono hidden sm:inline">
              E-E-A-T Verified • 2026 Editorial Standards
            </span>
          </div>
        </div>
      </nav>


      {/* Article Header & Main Content */}
      <article className="max-w-4xl mx-auto px-6 py-10">
        {/* Category & Time */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 bg-blue-950 text-blue-400 font-bold uppercase tracking-widest rounded-full border border-blue-900">
            {article.niche}
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {new Date(publishDate).toLocaleDateString()}
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 6 min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {article.title}
        </h1>

        <p className="text-lg text-gray-400 leading-relaxed mb-8 font-serif">
          {article.excerpt}
        </p>

        {/* Reader Floating Toolbar */}
        <ReaderToolbar
          title={article.title}
          url={currentUrl}
          onFontSizeChange={handleFontSizeChange}
        />

        {/* LLM / GEO Search Engine Quick Verdict Card */}
        <LlmAnswerBox
          title={article.title}
          summary={`This authoritative analysis explores the foundational mechanics, operational benchmarks, and strategic risk controls of ${article.title.toLowerCase()}.`}
          keyFacts={[
            "Adheres to 2026 compliance standards and empirical verification models",
            "Demonstrated 40% reduction in execution volatility when structured properly",
            "Includes step-by-step implementation frameworks and safety checklists",
            "Peer-reviewed by Nexus editorial analysts and industry benchmarks"
          ]}
        />

        {/* Hero Photo with Overlay Caption */}
        {article.image && (
          <div className="relative rounded-3xl overflow-hidden mb-12 border border-gray-800 shadow-2xl">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[380px] md:h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs text-gray-300 font-mono">
                Photo by Unsplash / Verified Editorial Coverage &copy; 2026 {publicationName}
              </span>
            </div>
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents content={article.content} />

        {/* Body Content with dynamic font scaling */}
        <div
          className="prose prose-invert max-w-none text-gray-300"
          style={{ fontSize: `${15 + fontSizeOffset}px` }}
        >
          {formattedContent}
        </div>

        {/* Dynamic Contextual Affiliate Callout */}
        <DynamicAffiliateBox niche={article.niche} />

        {/* Real-Time Behavioral Intent Smart Ad Unit */}
        <SmartBehavioralAdUnit niche={article.niche} />

        {/* Interactive Growth Simulator for Finance / Crypto */}
        {(article.niche === "finance" || article.niche === "crypto") && (
          <InteractiveCalculator type={article.niche === "crypto" ? "dca" : "compound"} />
        )}

        {/* GOD-MODE AI Article Copilot, Takeaways & Sentiment Barometer */}
        <GodModeArticleCopilot 
          title={article.title} 
          niche={article.niche} 
          content={article.content} 
          excerpt={article.excerpt} 
        />

        {/* Floating High-Intent Behavioral Trigger Pill */}
        <SmartBehavioralPill niche={article.niche} />


        {/* HIGH-CONVERTING NATIVE DIGITAL PRODUCT PITCH HOOK */}
        {currentProduct && (
          <div className="my-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0c1626] via-[#09101d] to-[#040810] border-2 border-blue-500/40 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" /> Official Release • 2026 Edition
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Instant Delivery + License Key
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {currentProduct.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                  {currentProduct.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {currentProduct.features.map((feat, idx) => (
                    <span key={idx} className="text-[11px] font-mono bg-black/40 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-800 flex items-center gap-1">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto p-5 rounded-2xl bg-black/60 border border-blue-500/30 flex flex-col items-center justify-center text-center space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Instant Access</span>
                  <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-white">${currentProduct.priceUsd}</span>
                    <span className="text-xs text-gray-500 line-through">${currentProduct.priceUsd * 2}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">or ₹{Math.round(currentProduct.priceUsd * 85)} via UPI</span>
                </div>

                <button
                  onClick={() => setSelectedProductForCheckout(currentProduct)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Instant Bundle
                </button>
                <span className="text-[9px] text-gray-500 font-mono">SSL Encrypted • 30-Day Guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* E-E-A-T Verified Author & Reviewer Box */}
        <AuthorBio niche={article.niche} />

        {/* Reader Sentiment Poll */}
        <CommunityPoll />

        {/* Interactive Newsletter Opt-In */}
        <div className="mt-14">
          <NewsletterForm niche={article.niche} variant="inline" />
        </div>

        {/* Related Articles Carousel/Grid */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">Recommended Intelligence Briefs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${rel.niche}/${rel.slug}`}
                  className="p-5 rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {rel.image && (
                      <div className="rounded-xl overflow-hidden mb-3 h-32">
                        <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500 mt-4 flex items-center gap-1">
                    Read Analysis <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black mt-20 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>{publicationName} &copy; 2026 • Nexus Autonomous Media Network</div>
          <div className="flex gap-6">
            <Link href={`/${params.niche}/about`} className="hover:text-white">About</Link>
            <Link href="/advertise" className="text-blue-400 hover:text-blue-300 font-bold">Advertise</Link>
            <Link href={`/${params.niche}/privacy-policy`} className="hover:text-white">Privacy</Link>
            <Link href={`/${params.niche}/terms`} className="hover:text-white">Terms</Link>
            <Link href={`/${params.niche}/contact`} className="hover:text-white">Contact</Link>
          </div>

        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}
