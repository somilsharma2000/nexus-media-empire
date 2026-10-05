"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Layers, 
  Clock, 
  Play, 
  RefreshCw, 
  ExternalLink,
  Bot,
  Flame,
  BarChart3,
  Video,
  Radio,
  FileText,
  Copy,
  Check
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
  niche: string;
  color: string;
  logo: string;
  twitterHandle: string;
  subreddits: string[];
  tone: string;
}

const BRANDS: Brand[] = [
  {
    id: "tech",
    name: "The Trend Matrix",
    niche: "AI, Tech & Startups",
    color: "from-blue-600 to-indigo-700",
    logo: "⚡",
    twitterHandle: "@TheTrendMatrix",
    subreddits: ["r/technology", "r/singularity", "r/artificial"],
    tone: "Analytical, forward-looking, high-signal developer insights."
  },
  {
    id: "crypto",
    name: "Crypto Daily",
    niche: "DeFi, Web3 & Security",
    color: "from-amber-500 to-orange-600",
    logo: "🪙",
    twitterHandle: "@CryptoDailyFeed",
    subreddits: ["r/CryptoCurrency", "r/ethereum", "r/Bitcoin"],
    tone: "Educational, risk-aware, zero-hype blockchain mechanics."
  },
  {
    id: "finance",
    name: "Wall St Insider",
    niche: "Wealth & Investing",
    color: "from-emerald-500 to-teal-700",
    logo: "📈",
    twitterHandle: "@WallStInsiderHQ",
    subreddits: ["r/personalfinance", "r/investing", "r/FIRE"],
    tone: "Disciplined, empirical wealth compounding frameworks."
  },
  {
    id: "saas",
    name: "Nexus SaaS Engine",
    niche: "B2B Marketing & Media Software",
    color: "from-purple-600 to-pink-600",
    logo: "🏢",
    twitterHandle: "@NexusMediaSaaS",
    subreddits: ["r/SaaS", "r/Entrepreneur", "r/SideProject"],
    tone: "Executive ROI, automation case studies, agency growth."
  },
  {
    id: "gym",
    name: "Gym-OS",
    niche: "Fitness & Club Management",
    color: "from-red-600 to-rose-700",
    logo: "🏋️",
    twitterHandle: "@GymOS_App",
    subreddits: ["r/fitnessbusiness", "r/gymowners"],
    tone: "Gym retention hacks, POS workflows, membership growth."
  }
];

export default function OmniSocialDashboard() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>(BRANDS[0]);
  const [activePlatform, setActivePlatform] = useState<"twitter" | "linkedin" | "reddit" | "reels" | "telegram">("twitter");
  const [topic, setTopic] = useState("Autonomous AI Agents in Production");
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastLog, setBlastLog] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-schedule toggles per brand
  const [autoSchedules, setAutoSchedules] = useState<Record<string, { twitter: boolean; reddit: boolean; linkedin: boolean; reels: boolean }>>({
    tech: { twitter: true, reddit: true, linkedin: true, reels: false },
    crypto: { twitter: true, reddit: true, linkedin: false, reels: false },
    finance: { twitter: true, reddit: false, linkedin: true, reels: false },
    saas: { twitter: true, reddit: true, linkedin: true, reels: true },
    gym: { twitter: false, reddit: false, linkedin: true, reels: true }
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleSchedule = (brandId: string, platform: "twitter" | "reddit" | "linkedin" | "reels") => {
    setAutoSchedules((prev) => ({
      ...prev,
      [brandId]: {
        ...prev[brandId],
        [platform]: !prev[brandId][platform]
      }
    }));
    showToast(`Updated automation schedule for ${selectedBrand.name}`);
  };

  const handleRunViralBlast = async () => {
    setIsBlasting(true);
    setBlastLog([]);

    const log = (msg: string) => {
      setBlastLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log(`🚀 Initiating God-Level Multi-Platform Viral Blast for [${selectedBrand.name}]...`);
    await new Promise((r) => setTimeout(r, 600));

    log(`🧠 Step 1: Synthesizing ${selectedBrand.tone}`);
    await new Promise((r) => setTimeout(r, 700));

    log(`🐦 Step 2: Formatted 6-tweet thread with high-retention hook for ${selectedBrand.twitterHandle}`);
    await new Promise((r) => setTimeout(r, 800));

    log(`💼 Step 3: Generated LinkedIn Executive Case Study with 4 key bullet frameworks`);
    await new Promise((r) => setTimeout(r, 600));

    log(`👾 Step 4: Formatted organic Reddit discussion for [${selectedBrand.subreddits[0]}]`);
    await new Promise((r) => setTimeout(r, 700));

    log(`🎬 Step 5: Generated 60-Second Short-Form Video Script with Voiceover prompts`);
    await new Promise((r) => setTimeout(r, 600));

    log(`✅ BLAST COMPLETE: Content distributed across all active queues with canonical authority links!`);
    setIsBlasting(false);
    showToast(`🚀 Multi-platform viral blast dispatched for ${selectedBrand.name}!`);
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic sample generation based on selected brand and platform
  const sampleContent = {
    twitter: [
      `1/ Why are 90% of founders approaching ${topic.toLowerCase()} completely wrong in 2026? 🧵👇`,
      `2/ The common misconception: thinking more complexity equals better performance. In reality, clean deterministic execution beats uncalibrated chaos every single time.`,
      `3/ Here is the 3-step framework our team at ${selectedBrand.name} deployed to achieve 3.8x higher throughput without breaking production.`,
      `4/ Step 1: Define deterministic boundary conditions and error-trapping gates.\nStep 2: Strip 100% of repetitive boilerplate.\nStep 3: Measure baseline latency quarterly.`,
      `5/ The benchmark data: Teams utilizing this disciplined workflow see a 42% drop in runtime overhead.`,
      `6/ We published our complete, verified architectural breakdown with code samples on ${selectedBrand.name}: https://thetrendmatrix.com 🚀`
    ],
    linkedin: `🚀 Why disciplined execution outperforms speculative hype in ${selectedBrand.niche}.\n\nWhen we analyzed over 50 real-world implementations of ${topic.toLowerCase()}, one clear pattern emerged: the top 5% performers don't overcomplicate.\n\nHere are 3 concrete lessons every operator should apply today:\n\n1. Establish strict verification gates before scaling.\n2. Prioritize high-information gain datasets over generic regurgitation.\n3. Measure unit economics and compound retention quarterly.\n\nWhat has been your biggest gotcha when implementing this in your team? Let's discuss in the comments.\n\n#${selectedBrand.id} #BusinessAutomation #GrowthEngineering #2026Playbook`,
    reddit: `[Discussion] What are the biggest lessons you've learned when deploying ${topic.toLowerCase()} in real production environments?\n\nHey everyone,\n\nWe've been spending the last few months benchmarking different architectures for ${selectedBrand.niche.toLowerCase()}, and we noticed that almost all standard tutorials miss the critical friction points around data drift and latency spikes.\n\nHere is what actually worked for us:\n- Strict schema enforcement before ingestion\n- Modular fallback layers instead of all-or-nothing pipelines\n- Real-time telemetry monitoring\n\nWould love to hear how other practitioners here are solving this. What tools or frameworks are in your active stack?`,
    reels: `[SCENE 1 - 0:00 to 0:05] [Fast Zoom on Host with Text Hook: "Stop doing THIS in 2026!"]\nHost: "If you're still doing ${topic.toLowerCase()} the old way, you are literally burning 5 hours a week."\n\n[SCENE 2 - 0:05 to 0:25] [B-roll of smooth dashboard UI and architecture diagram]\nHost: "Here's the secret that top operators use: instead of manual boilerplate, deploy a 3-pass automated verification pipeline."\n\n[SCENE 3 - 0:25 to 0:45] [On-screen 3-Step Checklist animation]\nHost: "Step 1: Set clear gate thresholds. Step 2: Purge repetitive clichés. Step 3: Automate your distribution loops."\n\n[SCENE 4 - 0:45 to 0:60] [CTA Banner: "Link in Bio for Free 18-Page Playbook"]\nHost: "Drop a comment with 'AUTOMATE' and I'll DM you our exact template!"`,
    telegram: `⚡ **${selectedBrand.name.toUpperCase()} INTELLIGENCE ALERT**\n\n📌 **Topic:** ${topic}\n📊 **Key Insight:** Adopting structured verification frameworks yields up to a 42% operational advantage in 2026.\n\n🔗 **Read Full Analysis:** https://thetrendmatrix.com/${selectedBrand.id === "tech" ? "news" : selectedBrand.id}\n\n*Broadcasted to 12,400+ executive subscribers.*`
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-purple-950 border border-purple-700 text-purple-200 text-xs font-mono shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400" /> {toast}
        </div>
      )}

      {/* Header & Brand Selector */}
      <div className="bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>OMNI-BRAND SOCIAL COMMAND CENTER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Multi-Brand Social Media Automation Matrix
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Control social distribution, viral threads, Reddit submissions, video scripts, and telegram broadcasts across all your separate businesses from one screen.
            </p>
          </div>

          <button
            onClick={handleRunViralBlast}
            disabled={isBlasting}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isBlasting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Blasting Across Platforms...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>1-Click Multi-Platform Viral Blast</span>
              </>
            )}
          </button>
        </div>

        {/* Brand Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-gray-900">
          {BRANDS.map((brand) => {
            const isSelected = selectedBrand.id === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-gray-900 border-purple-500 shadow-lg shadow-purple-950/40"
                    : "bg-black/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/40"
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${brand.color}`}></div>
                )}
                <div className="text-2xl mb-1.5">{brand.logo}</div>
                <div className="font-bold text-xs text-white truncate">{brand.name}</div>
                <div className="text-[10px] text-gray-400 truncate">{brand.niche}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal Output Log */}
      {blastLog.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/90 border border-gray-800 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
          {blastLog.map((line, i) => (
            <div
              key={i}
              className={
                line.includes("✅")
                  ? "text-emerald-400 font-bold"
                  : line.includes("🚀")
                  ? "text-purple-400 font-bold"
                  : "text-gray-300"
              }
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Social Studio & Autonomous Cadence Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content Generation & Format Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 space-y-5">
            {/* Active Brand Badge & Topic Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-900">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedBrand.logo}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedBrand.name}</h4>
                  <span className="text-[11px] text-purple-400 font-mono">{selectedBrand.twitterHandle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic / hook..."
                  className="px-3 py-1.5 bg-black border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { id: "twitter", label: "𝕏 (6-Tweet Thread)", icon: <Share2 className="w-3.5 h-3.5" /> },
                { id: "linkedin", label: "LinkedIn Authority", icon: <FileText className="w-3.5 h-3.5" /> },
                { id: "reddit", label: "Reddit Discussion", icon: <Radio className="w-3.5 h-3.5" /> },
                { id: "reels", label: "IG/YT Reels Script", icon: <Video className="w-3.5 h-3.5" /> },
                { id: "telegram", label: "Telegram Alert", icon: <Send className="w-3.5 h-3.5" /> },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activePlatform === p.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                      : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Content Output Box */}
            <div className="relative bg-black rounded-2xl p-5 border border-gray-800 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-900">
                <span className="font-mono uppercase text-[11px] text-purple-400">
                  {activePlatform.toUpperCase()} OPTIMIZED DRAFT
                </span>
                <button
                  onClick={() =>
                    copyContent(
                      Array.isArray(sampleContent[activePlatform])
                        ? (sampleContent[activePlatform] as string[]).join("\n\n")
                        : (sampleContent[activePlatform] as string)
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>

              {activePlatform === "twitter" ? (
                <div className="space-y-3">
                  {(sampleContent.twitter as string[]).map((tweet, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 text-xs text-gray-200">
                      <div className="text-[10px] text-purple-400 font-mono mb-1">Tweet {idx + 1}/6</div>
                      <p className="whitespace-pre-wrap leading-relaxed">{tweet}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {sampleContent[activePlatform] as string}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Brand Autopilot & Scheduled Cadence Matrix */}
        <div className="space-y-6">
          <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 space-y-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Autonomous Publishing Cadence</h4>
            </div>

            <p className="text-xs text-gray-400">
              Set automated posting loops for <strong>{selectedBrand.name}</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black border border-gray-800">
                <div>
                  <div className="font-semibold text-white">𝕏 / Twitter Auto-Threads</div>
                  <div className="text-[10px] text-gray-400">3 Threads / Day on Publish</div>
                </div>
                <button
                  onClick={() => handleToggleSchedule(selectedBrand.id, "twitter")}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                    autoSchedules[selectedBrand.id]?.twitter
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/60"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {autoSchedules[selectedBrand.id]?.twitter ? "Active" : "Paused"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black border border-gray-800">
                <div>
                  <div className="font-semibold text-white">Reddit Community Share</div>
                  <div className="text-[10px] text-gray-400">{selectedBrand.subreddits[0]} • Daily</div>
                </div>
                <button
                  onClick={() => handleToggleSchedule(selectedBrand.id, "reddit")}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                    autoSchedules[selectedBrand.id]?.reddit
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/60"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {autoSchedules[selectedBrand.id]?.reddit ? "Active" : "Paused"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black border border-gray-800">
                <div>
                  <div className="font-semibold text-white">LinkedIn Executive Case Studies</div>
                  <div className="text-[10px] text-gray-400">2x Weekly Broadcast</div>
                </div>
                <button
                  onClick={() => handleToggleSchedule(selectedBrand.id, "linkedin")}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                    autoSchedules[selectedBrand.id]?.linkedin
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/60"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {autoSchedules[selectedBrand.id]?.linkedin ? "Active" : "Paused"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black border border-gray-800">
                <div>
                  <div className="font-semibold text-white">Shorts & Reels Script Queue</div>
                  <div className="text-[10px] text-gray-400">Auto-Generates 60s Script</div>
                </div>
                <button
                  onClick={() => handleToggleSchedule(selectedBrand.id, "reels")}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                    autoSchedules[selectedBrand.id]?.reels
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/60"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {autoSchedules[selectedBrand.id]?.reels ? "Active" : "Paused"}
                </button>
              </div>
            </div>

            {/* Target Subreddits Badge List */}
            <div className="pt-3 border-t border-gray-900">
              <div className="text-[11px] text-gray-400 font-medium mb-2">Connected Target Communities:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedBrand.subreddits.map((sub, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg text-[10px] font-mono">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
