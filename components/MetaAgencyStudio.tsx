"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Video, 
  Send, 
  CheckCircle, 
  Copy, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Flame, 
  Zap, 
  ShieldCheck,
  RefreshCw,
  Eye
} from "lucide-react";

function Instagram({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function Facebook({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

interface Slide {
  slideNumber: number;
  type: string;
  headline: string;
  subtext: string;
  visualCue: string;
  calloutBadge: string;
}

interface MetaAutomation {
  id: string;
  name: string;
  niche: string;
  triggerKeyword: string;
  postType: string;
  targetUrl: string;
  dmsSent: number;
  conversions: number;
  isActive: boolean;
  dmTemplate: string;
}

export default function MetaAgencyStudio() {
  const [articles, setArticles] = useState<any[]>([]);
  const [campaignGoal, setCampaignGoal] = useState<"article_research" | "breaking_news" | "interactive_tool" | "digital_product" | "affiliate_deal">("article_research");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"carousel" | "reel" | "facebook" | "simulator" | "rules">("carousel");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [creativeData, setCreativeData] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Simulator state
  const [simUsername, setSimUsername] = useState("alex_investor");
  const [simComment, setSimComment] = useState("Please send RESEARCH link!");
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Automations list
  const [automations, setAutomations] = useState<MetaAutomation[]>([]);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
          setSelectedArticleId(String(data[0].id || data[0].slug));
          generateCreative(String(data[0].id || data[0].slug), "article_research");
        }
      })
      .catch(() => {});

    // Fetch automations
    fetch("/data/meta_automations.json")
      .then((res) => res.json())
      .then((data) => setAutomations(data))
      .catch(() => {});
  }, []);

  const generateCreative = async (articleId: string, goal = campaignGoal) => {
    setIsLoading(true);
    try {
      const selected = articles.find((a) => String(a.id || a.slug) === articleId);
      const res = await fetch("/api/social/meta/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          niche: selected?.niche || "news",
          campaignGoal: goal,
        }),
      });
      const data = await res.json();
      setCreativeData(data);
      setCurrentSlideIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestSimulator = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/social/meta/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText: simComment,
          username: simUsername,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const slides: Slide[] = creativeData?.carouselSlides || [];
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-[#0c1424] via-[#09101a] to-[#04070d] border border-blue-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-pink-950/80 text-pink-400 border border-pink-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Instagram className="w-3 h-3" /> Meta Growth &amp; Auto-DM Agency
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              Top 2% Agency Grade
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Instagram &amp; Facebook Autonomous Growth Studio
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Generate 10-slide visual carousels, Reels scripts, and viral captions. Every post converts readers via automated Comment-to-DM triggers.
          </p>
        </div>

        {/* Article Selector */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedArticleId}
            onChange={(e) => {
              setSelectedArticleId(e.target.value);
              generateCreative(e.target.value, campaignGoal);
            }}
            className="bg-[#060b14] border border-gray-800 text-xs text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono w-full lg:w-72"
          >
            {articles.map((art) => (
              <option key={art.id} value={String(art.id || art.slug)}>
                {art.title.slice(0, 42)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => generateCreative(selectedArticleId, campaignGoal)}
            disabled={isLoading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-lg shadow-blue-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Campaign Archetype / Entity Type Selector */}
      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            🎯 Target Campaign Archetype &amp; Auto-DM Intent
          </span>
          <span className="text-[10px] font-mono text-blue-400">
            Current Keyword: <strong>"{creativeData?.triggerKeyword || 'READ'}"</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: "article_research", label: "📚 Full Research Teardown", desc: "Pure Knowledge & Article Link" },
            { id: "breaking_news", label: "🚨 Breaking News Alert", desc: "Urgent Market Shift & Live Feed" },
            { id: "interactive_tool", label: "📊 Free Web Calculator", desc: "Compounding Tool Link" },
            { id: "digital_product", label: "⚡ Paid Execution Toolkit", desc: "Digital Pack + Discount Code" },
            { id: "affiliate_deal", label: "🛡️ Hardware & SaaS Tool", desc: "Partner Review + Bonus Credit" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const goal = item.id as any;
                setCampaignGoal(goal);
                generateCreative(selectedArticleId, goal);
              }}
              className={`p-3 rounded-xl border text-left transition ${
                campaignGoal === item.id
                  ? "bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950/40"
                  : "bg-black/50 border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700"
              }`}
            >
              <div className="text-xs font-bold leading-tight">{item.label}</div>
              <div className="text-[10px] text-gray-500 mt-1 truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab("carousel")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "carousel"
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/20"
              : "bg-gray-900/60 text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" /> 10-Slide Instagram Carousel
        </button>

        <button
          onClick={() => setActiveTab("reel")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "reel"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20"
              : "bg-gray-900/60 text-gray-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" /> 9:16 Reel / Story Script
        </button>

        <button
          onClick={() => setActiveTab("facebook")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "facebook"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20"
              : "bg-gray-900/60 text-gray-400 hover:text-white"
          }`}
        >
          <Facebook className="w-4 h-4" /> Facebook Authority Post
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "simulator"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20"
              : "bg-gray-900/60 text-gray-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-4 h-4" /> Live Comment-to-DM Simulator
        </button>
      </div>

      {/* TAB 1: 10-SLIDE INSTAGRAM CAROUSEL */}
      {activeTab === "carousel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slide Visual Card Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">
                Slide {currentSlideIndex + 1} of {slides.length} • {currentSlide?.type}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-30 hover:bg-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-30 hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rendered 1:1 Instagram Card Mockup */}
            {currentSlide && (
              <div className="aspect-square w-full max-w-[500px] mx-auto rounded-3xl p-8 bg-gradient-to-br from-[#0a0f1d] via-[#050811] to-[#020408] border-2 border-pink-500/30 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                {/* Glow & Branding Header */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-pink-950 text-pink-300 border border-pink-800 uppercase tracking-widest">
                    {currentSlide.calloutBadge}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 font-bold">
                    0{currentSlide.slideNumber} / 10
                  </span>
                </div>

                {/* Middle Content */}
                <div className="space-y-3 relative z-10 my-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {currentSlide.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                    {currentSlide.subtext}
                  </p>
                </div>

                {/* Footer Visual Specification */}
                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between relative z-10 text-[10px] font-mono text-gray-400">
                  <span className="text-pink-400 font-bold">@TheTrendMatrix • 2026</span>
                  <span>Swipe Left ➔</span>
                </div>
              </div>
            )}

            {/* Slide Quick Picker Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                    currentSlideIndex === idx
                      ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                      : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  #{idx + 1} {s.type}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Slide Visual Spec & Instagram Caption */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  🎨 Slide #{currentSlideIndex + 1} Design Specs
                </h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(currentSlide, null, 2), "slide-spec")}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  {copiedSection === "slide-spec" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Spec
                </button>
              </div>
              <p className="text-xs text-gray-300 bg-black/50 p-3 rounded-xl border border-gray-800/80 font-mono">
                <strong>Visual Cue:</strong> {currentSlide?.visualCue}
              </p>
            </div>

            {/* Caption & Auto-DM Trigger */}
            <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    📝 High-Converting Caption (With Auto-DM)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Viral Score 98/100
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(creativeData?.instagramCaption || "", "caption")}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  {copiedSection === "caption" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Caption
                </button>
              </div>

              <textarea
                readOnly
                value={creativeData?.instagramCaption || ""}
                rows={10}
                className="w-full bg-black/60 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 font-sans leading-relaxed focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 9:16 REELS / STORY SCRIPT */}
      {activeTab === "reel" && creativeData?.reelScript && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" /> 45-Second Viral Reel / Story Script
                </h3>
                <span className="text-xs font-mono text-gray-400">Audio: {creativeData.reelScript.soundRecommendation}</span>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(creativeData.reelScript, null, 2), "reel-script")}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {copiedSection === "reel-script" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Script
              </button>
            </div>

            {/* Script Breakdown */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-2">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                  ⏱️ 0:00 - 0:03 (Viral Hook - 3 Sec)
                </span>
                <p className="text-sm font-bold text-white">"{creativeData.reelScript.hook0to3s}"</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-2">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                  ⏱️ 0:03 - 0:35 (The Meat &amp; Architecture)
                </span>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {creativeData.reelScript.body3to35s}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  ⏱️ 0:35 - 0:45 (Comment-to-DM Call to Action)
                </span>
                <p className="text-xs font-bold text-emerald-300">
                  {creativeData.reelScript.cta35to45s}
                </p>
              </div>
            </div>
          </div>

          {/* On Screen Text Overlays */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              📱 On-Screen Text Overlays
            </h4>
            <div className="space-y-3">
              {creativeData.reelScript.onScreenText.map((txt: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-black/60 border border-gray-800 text-xs font-mono text-gray-200">
                  {i + 1}. {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACEBOOK AUTHORITY POST */}
      {activeTab === "facebook" && creativeData?.facebookPost && (
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-3xl bg-gray-950 border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-500" /> Facebook Long-Form Authority Teardown
              </h3>
              <p className="text-xs text-gray-400">Engineered with the 1st-comment link strategy to bypass reach suppression.</p>
            </div>
            <button
              onClick={() => copyToClipboard(creativeData.facebookPost.body, "fb-post")}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              {copiedSection === "fb-post" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Post
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-black/50 border border-gray-800 space-y-3">
              <h4 className="font-bold text-white text-base">{creativeData.facebookPost.headline}</h4>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                {creativeData.facebookPost.body}
              </p>
            </div>

            {/* 1st Comment Strategy */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                💬 Sticky First Comment (Post immediately after publishing):
              </span>
              <p className="text-xs font-mono text-gray-200 bg-black/60 p-3 rounded-xl border border-gray-800">
                {creativeData.facebookPost.firstComment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE COMMENT-TO-DM SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Controls */}
          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-gray-950 border border-gray-800 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" /> Meta Auto-DM Live Testing Suite
              </h3>
              <p className="text-xs text-gray-400">
                Type any comment to simulate what an Instagram or Facebook user receives in their Direct Messages.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1.5">Simulated User Handle</label>
                <input
                  type="text"
                  value={simUsername}
                  onChange={(e) => setSimUsername(e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. alex_investor"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1.5">User Comment on Post</label>
                <input
                  type="text"
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. Please send MATRIX link!"
                />
              </div>

              <button
                onClick={handleTestSimulator}
                disabled={isSimulating}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Simulate Meta Comment Webhook
              </button>
            </div>

            {/* Active Triggers */}
            <div className="pt-4 border-t border-gray-800">
              <span className="text-[10px] font-mono uppercase text-gray-500 block mb-2">Active Trigger Keywords</span>
              <div className="flex flex-wrap gap-2">
                {automations.map((a) => (
                  <span key={a.id} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-black/60 text-emerald-400 border border-emerald-800/40">
                    "{a.triggerKeyword}" ➔ {a.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[340px] rounded-[40px] bg-black border-4 border-gray-800 p-4 shadow-2xl space-y-4">
              {/* Phone Speaker & Notch */}
              <div className="w-24 h-4 bg-gray-900 rounded-full mx-auto" />

              {/* Instagram Direct Header */}
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    N
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">The Trend Matrix</h5>
                    <span className="text-[9px] text-emerald-400 font-mono">Active now</span>
                  </div>
                </div>
                <Instagram className="w-4 h-4 text-pink-400" />
              </div>

              {/* Chat Message Bubble */}
              <div className="min-h-[280px] flex flex-col justify-end space-y-3 px-1">
                {simResult ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-[#0e1726] border border-blue-500/40 text-xs text-gray-200 leading-relaxed font-sans space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                        <CheckCircle className="w-3 h-3" /> Auto-DM Triggered
                      </div>
                      <p className="whitespace-pre-line">{simResult.dmDelivered}</p>
                    </div>

                    <div className="text-center text-[10px] text-gray-500 font-mono">
                      Public Reply: "{simResult.publicCommentReply}"
                    </div>
                  </>
                ) : (
                  <div className="text-center text-xs text-gray-600 font-mono py-16">
                    Type a comment on the left and click "Simulate" to see the direct message in action.
                  </div>
                )}
              </div>

              {/* Bottom Message Input Bar */}
              <div className="p-2.5 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-between text-xs text-gray-500 px-4">
                <span>Message...</span>
                <Send className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
