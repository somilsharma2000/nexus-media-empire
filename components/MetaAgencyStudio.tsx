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
  Eye,
  UserCheck,
  Lock,
  Unlock,
  CornerDownRight,
  ExternalLink
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
  pageHandle?: string;
  triggerMode?: string;
  triggerKeyword: string;
  postType: string;
  targetUrl: string;
  dmsSent: number;
  conversions: number;
  isActive: boolean;
  step1FollowRequestDm?: string;
  step2PayloadDm?: string;
  publicCommentReply?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
  quickReplyLabel?: string;
  isVerified?: boolean;
  linkUrl?: string;
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

  // 2-Step Phone Simulator State
  const [simUsername, setSimUsername] = useState("alex_investor");
  const [simComment, setSimComment] = useState("Amazing breakdown! Can I get the direct link?");
  const [simStep, setSimStep] = useState<1 | 2>(1);
  const [isFollowerVerified, setIsFollowerVerified] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [publicComments, setPublicComments] = useState<{ id: string; user: string; text: string; isBotReply?: boolean }[]>([]);
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
      resetSimulator(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulator = (currentCreative = creativeData) => {
    setSimStep(1);
    setIsFollowerVerified(false);
    setChatHistory([]);
    setPublicComments([]);
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SIMULATOR DISPATCH: USER POSTS A COMMENT (STEP 1)
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePostComment = async () => {
    if (!simComment.trim()) return;
    setIsSimulating(true);

    const userCommentText = simComment;
    const currentUsername = simUsername;

    // Add user's comment to public post thread
    const newComments = [
      { id: `c-${Date.now()}`, user: currentUsername, text: userCommentText }
    ];
    setPublicComments(newComments);

    try {
      const res = await fetch("/api/social/meta/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText: userCommentText,
          username: currentUsername,
        }),
      });
      const data = await res.json();

      // Append bot public reply to public thread
      if (data.publicCommentReply) {
        setPublicComments((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            user: creativeData?.pageHandle?.replace('@', '') || "TheTrendMatrix",
            text: data.publicCommentReply,
            isBotReply: true,
          }
        ]);
      }

      // Initialize DM chat history with Step 1 Follow Request
      setChatHistory([
        {
          id: `dm-1-${Date.now()}`,
          sender: 'bot',
          text: data.step1Dm || `Hey @${currentUsername}! 👋 Thanks for commenting! 🔒 Quick check: To unlock the un-gated article link, please make sure you follow ${creativeData?.pageHandle || '@TheTrendMatrix'}.\n\n👉 Tap 'I Am Following ✅' below to verify and receive instant access! 🚀`,
          timestamp: 'Just now',
          isQuickReply: true,
          quickReplyLabel: 'I Am Following ✅',
        }
      ]);

      setSimStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SIMULATOR DISPATCH: USER CONFIRMS FOLLOW (STEP 2)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleConfirmFollow = async () => {
    setIsSimulating(true);
    const currentUsername = simUsername;

    // Add user's confirmation message to chat
    setChatHistory((prev) => [
      ...prev,
      {
        id: `user-confirm-${Date.now()}`,
        sender: 'user',
        text: 'I Am Following ✅',
        timestamp: 'Just now',
      }
    ]);

    try {
      const res = await fetch("/api/social/meta/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'confirm_follow',
          username: currentUsername,
          commentText: 'YES I AM FOLLOWING',
        }),
      });
      const data = await res.json();

      setIsFollowerVerified(true);
      setSimStep(2);

      // Bot dispatches the un-gated link in Step 2 DM
      const fallbackLink = typeof window !== 'undefined' ? window.location.origin : 'https://media-empire-beta.vercel.app';
      setChatHistory((prev) => [
        ...prev,
        {
          id: `dm-2-${Date.now()}`,
          sender: 'bot',
          text: data.dmDelivered || `🎉 Verified & Access Granted @${currentUsername}!\n\n🚀 Here is your exclusive direct link:\n${creativeData?.targetUrl || fallbackLink}\n\nEnjoy reading! 💡`,
          timestamp: 'Just now',
          isVerified: true,
          linkUrl: data.targetUrl || creativeData?.targetUrl,
        }
      ]);
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
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Facebook className="w-3 h-3" /> Algorithm Shield
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-3 h-3" /> 2-Step Follow-Gated
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Universal Comment-to-DM Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-normal">
              Any Comment ➔ Follow Verify ➔ Instant Link
            </span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Triggers when users comment <span className="text-amber-400 font-semibold">ANYTHING</span>. Checks follow status before DMing direct article links, interactive tools, and VIP discount codes with zero link suppression.
          </p>
        </div>

        {/* Campaign Goal Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Campaign Archetype</label>
            <select
              value={campaignGoal}
              onChange={(e) => {
                const newGoal = e.target.value as any;
                setCampaignGoal(newGoal);
                if (selectedArticleId) generateCreative(selectedArticleId, newGoal);
              }}
              className="bg-slate-900 text-xs text-white border border-slate-700 rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="article_research">📚 Pure Article Research (Free Knowledge Link)</option>
              <option value="breaking_news">🚨 Breaking News &amp; Flash Alert (Live Timeline Link)</option>
              <option value="interactive_tool">📊 Interactive Web Tool / Calculator (Web App Link)</option>
              <option value="digital_product">⚡ Digital Execution Toolkit (Paid Bundle + 20% Off)</option>
              <option value="affiliate_deal">🛡️ Affiliate Deal / Tool Review (Bonus Credit Link)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Target Article</label>
            <select
              value={selectedArticleId}
              onChange={(e) => {
                setSelectedArticleId(e.target.value);
                generateCreative(e.target.value, campaignGoal);
              }}
              className="bg-slate-900 text-xs text-white border border-slate-700 rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none max-w-xs truncate"
            >
              {articles.map((art) => (
                <option key={art.id || art.slug} value={String(art.id || art.slug)}>
                  [{art.niche?.toUpperCase()}] {art.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => generateCreative(selectedArticleId, campaignGoal)}
            disabled={isLoading}
            className="self-end px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("carousel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "carousel"
              ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          10-Slide Instagram Carousel Deck
        </button>

        <button
          onClick={() => setActiveTab("reel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "reel"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          45s High-Retention Reel / Story Script
        </button>

        <button
          onClick={() => setActiveTab("facebook")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "facebook"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Facebook className="w-4 h-4" />
          Facebook Authority Teardown (1st Comment Link)
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "simulator"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Live Comment &amp; Follow-Gate Simulator
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "rules"
              ? "bg-slate-700 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          Automations &amp; Webhooks ({automations.length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 1: INSTAGRAM CAROUSEL 10-SLIDE VISUAL DESIGNER
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "carousel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Slide Card Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/5] rounded-3xl bg-gradient-to-b from-slate-900 via-[#0b101b] to-black border-2 border-slate-700/80 p-8 sm:p-12 flex flex-col justify-between shadow-2xl overflow-hidden group">
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header inside slide */}
              <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white font-black text-xs">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wider font-mono">
                      {creativeData?.pageHandle || "@TheTrendMatrix"}
                    </div>
                    <div className="text-[10px] text-slate-400">Autonomous Intelligence Desk</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                    {currentSlide?.calloutBadge}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-pink-600/30 text-pink-300 border border-pink-500/50">
                    Slide {currentSlideIndex + 1} / {slides.length}
                  </span>
                </div>
              </div>

              {/* Slide Body Content */}
              <div className="space-y-6 z-10 my-auto py-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                  {currentSlide?.type}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                  {currentSlide?.headline}
                </h2>
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                  {currentSlide?.subtext}
                </div>
              </div>

              {/* Slide Footer with Visual Cue */}
              <div className="z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-mono text-slate-300">Design Spec:</span> {currentSlide?.visualCue}
                </div>

                {/* Next/Prev controls */}
                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Navigation Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                    currentSlideIndex === idx
                      ? "bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-600/30"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <span>{idx + 1}</span>
                  <span className="text-[10px] opacity-75">{s.type.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Caption, Slide 10 Trigger Info, and Follow-Gating Spec */}
          <div className="lg:col-span-4 space-y-6">
            {/* Slide 10 Follow-Gate Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5 font-mono uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-pink-400" /> 2-Step Follow-Gated Trigger
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  ANY COMMENT
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When readers comment <strong className="text-amber-400">ANYTHING</strong> on the post, our webhook fires Step 1 to verify they follow <strong className="text-pink-400">{creativeData?.pageHandle || '@TheTrendMatrix'}</strong>. Once verified, the un-gated article link is unlocked!
              </p>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="text-[10px] text-slate-400 font-mono">STEP 1 PUBLIC REPLY:</div>
                <div className="text-slate-200 font-mono text-[11px]">
                  {creativeData?.followGateInfo?.publicCommentReply?.replace('{username}', 'alex_investor') || '@alex_investor Check your DMs! 📩'}
                </div>
              </div>
            </div>

            {/* Instagram Caption */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" /> Viral Instagram Caption
                </span>
                <button
                  onClick={() => copyToClipboard(creativeData?.instagramCaption || "", "ig_caption")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition"
                >
                  {copiedSection === "ig_caption" ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === "ig_caption" ? "Copied" : "Copy"}
                </button>
              </div>

              <textarea
                readOnly
                value={creativeData?.instagramCaption || ""}
                rows={10}
                className="w-full bg-slate-950 text-xs text-slate-300 font-mono p-3 rounded-xl border border-slate-800 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 2: REEL / STORY 45-SECOND VIRAL SCRIPT
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "reel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-purple-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">45-Second Viral Reel / Story Script</h3>
                    <p className="text-xs text-slate-400 font-mono">Format: 9:16 Vertical Video with Follow-Verification Call-to-Action</p>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(creativeData?.reelScript, null, 2), "reel_script")}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition"
                >
                  {copiedSection === "reel_script" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === "reel_script" ? "Copied Script" : "Copy Script"}
                </button>
              </div>

              {/* 0-3s Hook */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-300">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> 00:00 - 00:03 (Scroll-Stopping Spoken Hook)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200">MAX RETENTION</span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  &quot;{creativeData?.reelScript?.hook0to3s}&quot;
                </p>
              </div>

              {/* 3-35s Body */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-400">
                  00:03 - 00:35 (Empirical Value Teardown &amp; B-Roll Action)
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {creativeData?.reelScript?.body3to35s}
                </p>
              </div>

              {/* 35-45s Follow-Gated Call to Action */}
              <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-2">
                <div className="text-xs font-mono font-bold text-pink-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-pink-400" /> 00:35 - 00:45 (Universal Comment &amp; Follow Verification CTA)
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  &quot;{creativeData?.reelScript?.cta35to45s}&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* On Screen Text Badges */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> On-Screen Text Overlays
              </span>
              <div className="space-y-2">
                {creativeData?.reelScript?.onScreenText?.map((txt: string, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <span className="text-purple-400 font-bold">#{idx + 1}</span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Recommended Audio Vibe</div>
                <div className="text-xs font-bold text-purple-300 mt-1">
                  {creativeData?.reelScript?.soundRecommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 3: FACEBOOK LONG-FORM AUTHORITY TEARDOWN
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "facebook" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-blue-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800">
                    <Facebook className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">Facebook Long-Form Authority Teardown</h3>
                    <p className="text-xs text-slate-400 font-mono">Algorithm-Safe: Preserves 100% feed reach via 1st-Comment Link Strategy</p>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(creativeData?.facebookPost?.body || "", "fb_post")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition"
                >
                  {copiedSection === "fb_post" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === "fb_post" ? "Copied Post" : "Copy Post"}
                </button>
              </div>

              {/* Main FB Post */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">{creativeData?.facebookPost?.headline}</h4>
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {creativeData?.facebookPost?.body}
                </div>
              </div>

              {/* Safe First Comment Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pinned 1st Comment (Safe Outbound Link)
                  </span>
                  <button
                    onClick={() => copyToClipboard(creativeData?.facebookPost?.firstComment || "", "fb_first_comment")}
                    className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-mono flex items-center gap-1 transition"
                  >
                    {copiedSection === "fb_first_comment" ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSection === "fb_first_comment" ? "Copied" : "Copy Link Comment"}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/50 text-xs font-mono text-emerald-200">
                  {creativeData?.facebookPost?.firstComment}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-mono uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Why This Avoids De-ranking
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Meta systematically penalizes posts containing direct external URLs in the primary caption by <strong>70%–80%</strong>.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                By delivering the main value in the post and putting the link in the <strong>1st Comment</strong> and in <strong>Automated Follow-Gated DMs</strong>, you capture organic viral distribution while converting 100% of engaged readers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 4: LIVE 2-STEP COMMENT & FOLLOWER VERIFICATION SIMULATOR
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-emerald-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">2-Step Follow-Gated Verification Engine</h3>
                    <p className="text-xs text-slate-400 font-mono">Test the complete end-to-end conversation flow in real time</p>
                  </div>
                </div>

                <button
                  onClick={() => resetSimulator()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Chat
                </button>
              </div>

              {/* Step 1 Input: User Comment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    User Posts Any Comment
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Triggers for ANY text
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono">Commenter Username</label>
                    <input
                      type="text"
                      value={simUsername}
                      onChange={(e) => setSimUsername(e.target.value)}
                      className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono">Comment Archetype</label>
                    <div className="mt-1 text-xs text-slate-300 font-mono p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      {campaignGoal.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono">User Comment Text (Type anything you want)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={simComment}
                      onChange={(e) => setSimComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                      placeholder="e.g. This is incredible! Send me the link please"
                      className="flex-1 bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={isSimulating || !simComment.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Post Comment
                    </button>
                  </div>
                </div>

                {/* Quick test phrases */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono self-center mr-1">Quick Test:</span>
                  {[
                    "Send me the link please!",
                    "🔥 loved this breakdown",
                    "How do I access this?",
                    "READ",
                    "CALC",
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => setSimComment(phrase)}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300 transition"
                    >
                      &quot;{phrase}&quot;
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 Gate: Follower Confirmation */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Follower Verification Challenge
                  </label>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isFollowerVerified 
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800 font-bold" 
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}>
                    {isFollowerVerified ? "VERIFIED ACTIVE FOLLOWER 🟢" : "AWAITING CONFIRMATION 🟡"}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  The bot will NOT release the direct link until the follower check is confirmed. Click the button below or tap the button inside the phone screen to simulate the reader confirming their follow!
                </p>

                <button
                  onClick={handleConfirmFollow}
                  disabled={isSimulating || simStep === 2 || chatHistory.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 disabled:opacity-40"
                >
                  <UserCheck className="w-4 h-4" />
                  Simulate User Tapping &quot;I Am Following ✅&quot;
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Smartphone Screen Simulator */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[40px] bg-slate-950 border-4 border-slate-700 p-4 shadow-2xl space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[620px]">
              {/* Phone Top Speaker / Camera Notch */}
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
                <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
              </div>

              {/* Instagram / Meta App Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-xs">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {creativeData?.pageHandle || "@TheTrendMatrix"}
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="text-[9px] text-slate-400">Automated Direct Message</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Live
                </span>
              </div>

              {/* Public Comment Thread Section (if any) */}
              {publicComments.length > 0 && (
                <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-pink-400" /> Public Post Comment Thread
                  </div>
                  {publicComments.map((c) => (
                    <div key={c.id} className={`p-2 rounded-xl text-[11px] ${c.isBotReply ? "bg-blue-950/40 border border-blue-900/60 ml-3" : "bg-slate-950 border border-slate-800"}`}>
                      <span className="font-bold text-white">@{c.user}: </span>
                      <span className={c.isBotReply ? "text-blue-200" : "text-slate-300"}>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* DM Chat Message Bubbles */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] px-1 py-2">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400">No active conversation.</p>
                    <p className="text-[11px] text-slate-500">Post a comment on the left to trigger the automation!</p>
                  </div>
                ) : (
                  chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : msg.isVerified
                            ? "bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-100 border border-emerald-500/40 rounded-bl-none shadow-lg"
                            : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                        }`}
                      >
                        <div className="whitespace-pre-line text-[11px]">{msg.text}</div>

                        {/* If direct link delivered in Step 2 */}
                        {msg.linkUrl && (
                          <div className="mt-2 pt-2 border-t border-emerald-800/60">
                            <a
                              href={msg.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow"
                            >
                              Open Un-gated Resource <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Interactive Quick Reply Button attached to Step 1 */}
                      {msg.isQuickReply && simStep === 1 && (
                        <div className="pt-1">
                          <button
                            onClick={handleConfirmFollow}
                            disabled={isSimulating}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-[11px] font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition animate-bounce"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {msg.quickReplyLabel || "I Am Following ✅"}
                          </button>
                        </div>
                      )}

                      <span className="text-[9px] text-slate-500 font-mono px-1">{msg.timestamp}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Phone Bottom Input Bar */}
              <div className="border-t border-slate-800 pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder={simStep === 1 ? "Comment above to trigger Step 1..." : "Access granted & link delivered."}
                  className="flex-1 bg-slate-900 text-[11px] text-slate-400 p-2 rounded-full border border-slate-800 focus:outline-none"
                />
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 5: ACTIVE AUTOMATIONS & WEBHOOK CONFIGURATION
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Meta Comment-to-DM Webhook Rules</h3>
                <p className="text-xs text-slate-400 font-mono">Live Meta Graph API Listeners &amp; Follow-Verification Gateways</p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {automations.filter((a) => a.isActive).length} Active Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {automations.map((auto) => (
                <div key={auto.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                      {auto.niche}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {auto.conversions} Conversions
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{auto.name}</h4>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
                    <div className="text-slate-400 font-mono text-[10px]">TRIGGER:</div>
                    <div className="text-amber-400 font-mono font-semibold">ANY COMMENT (Universal)</div>
                    <div className="text-slate-400 font-mono text-[10px] pt-1">PAGE HANDLE:</div>
                    <div className="text-pink-400 font-mono font-semibold">@{auto.pageHandle || 'TheTrendMatrix'}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span>DMs Sent: <strong className="text-white">{auto.dmsSent}</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <UserCheck className="w-3 h-3" /> Follow-Gated
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook Endpoint Info */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Meta Webhook Endpoint URL
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-xs text-slate-200 select-all border border-slate-800">
                https://yourdomain.com/api/social/meta/webhook
              </div>
              <p className="text-[11px] text-slate-400">
                Verify Token: <code className="text-blue-400">nexus_meta_secret_2026</code> (or set <code className="text-blue-400">META_WEBHOOK_VERIFY_TOKEN</code> in your environment variables).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
