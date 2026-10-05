"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Flame, 
  RefreshCw, 
  Share2, 
  Zap, 
  Layers, 
  TrendingUp,
  Bookmark,
  MessageSquare,
  Video,
  Radio,
  FileText
} from "lucide-react";

interface HookTemplate {
  archetype: string;
  name: string;
  badge: string;
  badgeColor: string;
  formula: string;
  example: string;
  platforms: string[];
}

const HOOK_ARCHETYPES: HookTemplate[] = [
  {
    archetype: "mistake",
    name: "The Costly Mistake",
    badge: "99% WRONG",
    badgeColor: "bg-red-950/60 text-red-400 border-red-800/60",
    formula: "99% of [Audience] are doing [Topic] wrong and losing [Negative Result]. Here is the 3-step fix:",
    example: "94% of crypto investors will lose 30% of their staking rewards to hidden validator slashing fees. Here is the 2-minute safety check before you lock your tokens:",
    platforms: ["𝕏", "LinkedIn", "Reels"]
  },
  {
    archetype: "experiment",
    name: "The Quantified Experiment",
    badge: "DATA PROOF",
    badgeColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    formula: "I spent [Time/Money] testing [Subject] so you don't have to. Here are the brutal results:",
    example: "We deployed $50,000 into 14 different DeFi yield pools across 90 days. 3 were rug pulls. 2 generated 380% APY. Here is the full transaction breakdown and audit sheet:",
    platforms: ["𝕏", "Reddit", "LinkedIn"]
  },
  {
    archetype: "contrarian",
    name: "The Contrarian Truth",
    badge: "UNPOPULAR OPINION",
    badgeColor: "bg-amber-950/60 text-amber-400 border-amber-800/60",
    formula: "[Commonly Accepted Belief] is dead in 2026. Here is what smart money is actually doing:",
    example: "Buying physical rental properties for passive income is dead in 2026. High-yield automated index liquidity pools pay 4x higher cashflow with zero tenants and zero mortgages:",
    platforms: ["𝕏", "Reels", "TikTok"]
  },
  {
    archetype: "curated",
    name: "The Curated Goldmine",
    badge: "SWIPE FILE",
    badgeColor: "bg-blue-950/60 text-blue-400 border-blue-800/60",
    formula: "I analyzed [Large Number] of [Items] to find the top [Small Number] you actually need:",
    example: "I audited over 500 AI productivity workflows used by Silicon Valley founders. 95% are useless fluff. These 7 autonomous setups save 18 hours per week:",
    platforms: ["𝕏", "LinkedIn", "Telegram"]
  },
  {
    archetype: "speedrun",
    name: "The Timeline Speedrun",
    badge: "ZERO TO ONE",
    badgeColor: "bg-purple-950/60 text-purple-400 border-purple-800/60",
    formula: "How to [Achieve High Desirable Goal] in [Short Timeframe] without [Biggest Pain Point]:",
    example: "How to scale an automated media publication to $10,000/month in 30 days without writing a single line of code or hiring expensive copywriters:",
    platforms: ["𝕏", "Reels", "YouTube"]
  },
  {
    archetype: "secret",
    name: "The Secret Playbook",
    badge: "INSIDER ALPHA",
    badgeColor: "bg-pink-950/60 text-pink-400 border-pink-800/60",
    formula: "The [Elite Group] doesn't want you to know this exact framework for [Outcome]:",
    example: "The 3-tier portfolio compounding strategy used by family offices managing $100M+ to legally minimize tax drag during bull cycles:",
    platforms: ["𝕏", "LinkedIn", "Telegram"]
  },
  {
    archetype: "contrast",
    name: "The Negative Contrast",
    badge: "WARNING",
    badgeColor: "bg-orange-950/60 text-orange-400 border-orange-800/60",
    formula: "Never do [Action X] until you verify these [Number] critical variables:",
    example: "Never sign a commercial lease or buy fitness equipment until you run this 1-page foot-traffic and member-churn formula:",
    platforms: ["Reddit", "LinkedIn", "𝕏"]
  }
];

export default function ViralHookStudio() {
  const [selectedNiche, setSelectedNiche] = useState("crypto");
  const [topicInput, setTopicInput] = useState("Autonomous AI Staking & Portfolio Management");
  const [audienceInput, setAudienceInput] = useState("DeFi investors");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [generatedHooks, setGeneratedHooks] = useState(HOOK_ARCHETYPES);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateFresh = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const topic = topicInput || "Autonomous Digital Media";
      const audience = audienceInput || "online creators";

      const fresh = [
        {
          archetype: "mistake",
          name: "The Costly Mistake",
          badge: "99% WRONG",
          badgeColor: "bg-red-950/60 text-red-400 border-red-800/60",
          formula: "99% of [Audience] are doing [Topic] wrong...",
          example: `94% of ${audience} are wasting thousands on ${topic} without knowing this single optimization rule. Here is the exact fix:`,
          platforms: ["𝕏", "LinkedIn", "Reels"]
        },
        {
          archetype: "experiment",
          name: "The Quantified Experiment",
          badge: "DATA PROOF",
          badgeColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
          formula: "I tested [Topic] for 90 days...",
          example: `We spent 120 hours stress-testing ${topic} with $25,000 live capital. 4 strategies failed completely. 1 made $14,200. Here are the raw logs:`,
          platforms: ["𝕏", "Reddit", "LinkedIn"]
        },
        {
          archetype: "contrarian",
          name: "The Contrarian Truth",
          badge: "UNPOPULAR OPINION",
          badgeColor: "bg-amber-950/60 text-amber-400 border-amber-800/60",
          formula: "Why [Topic] traditional advice is obsolete...",
          example: `The traditional playbook for ${topic} is dead in 2026. The new playbook used by top 1% of ${audience} is completely different:`,
          platforms: ["𝕏", "Reels", "TikTok"]
        },
        {
          archetype: "curated",
          name: "The Curated Goldmine",
          badge: "SWIPE FILE",
          badgeColor: "bg-blue-950/60 text-blue-400 border-blue-800/60",
          formula: "I analyzed 500+ case studies...",
          example: `I reviewed 250+ real-world implementations of ${topic}. Only 5 frameworks actually delivered consistent 5-figure ROI:`,
          platforms: ["𝕏", "LinkedIn", "Telegram"]
        },
        {
          archetype: "speedrun",
          name: "The Timeline Speedrun",
          badge: "ZERO TO ONE",
          badgeColor: "bg-purple-950/60 text-purple-400 border-purple-800/60",
          formula: "How to master [Topic] in record time...",
          example: `How to master ${topic} in 14 days without getting overwhelmed by technical jargon:`,
          platforms: ["𝕏", "Reels", "YouTube"]
        },
        {
          archetype: "secret",
          name: "The Secret Playbook",
          badge: "INSIDER ALPHA",
          badgeColor: "bg-pink-950/60 text-pink-400 border-pink-800/60",
          formula: "The insider framework for [Topic]...",
          example: `The private checklist high-performing ${audience} use to execute ${topic} with zero downtime:`,
          platforms: ["𝕏", "LinkedIn", "Telegram"]
        },
        {
          archetype: "contrast",
          name: "The Negative Contrast",
          badge: "WARNING",
          badgeColor: "bg-orange-950/60 text-orange-400 border-orange-800/60",
          formula: "Never start [Topic] before checking this...",
          example: `Never deploy capital into ${topic} before answering these 3 safety questions:`,
          platforms: ["Reddit", "LinkedIn", "𝕏"]
        }
      ];

      setGeneratedHooks(fresh);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Studio Controls Header */}
      <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Viral Hook Synthesis Studio
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Generate high-retention psychological hooks across all 7 viral archetypes for 𝕏, LinkedIn, Reddit, and Reels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {["crypto", "finance", "news", "saas", "gym"].map(niche => (
              <button
                key={niche}
                onClick={() => {
                  setSelectedNiche(niche);
                  if (niche === "crypto") {
                    setTopicInput("Staking Yields & Hardware Security");
                    setAudienceInput("crypto investors");
                  } else if (niche === "finance") {
                    setTopicInput("Compound Wealth & Passive Index Funds");
                    setAudienceInput("FIRE seekers & retail investors");
                  } else if (niche === "news") {
                    setTopicInput("Autonomous AI Agent Architectures");
                    setAudienceInput("tech founders & developers");
                  } else if (niche === "saas") {
                    setTopicInput("Zero-Churn Customer Retention");
                    setAudienceInput("SaaS builders");
                  } else if (niche === "gym") {
                    setTopicInput("Boutique Gym Membership Systems");
                    setAudienceInput("gym owners");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedNiche === niche
                    ? "bg-amber-500 text-black shadow-md shadow-amber-950/40"
                    : "bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50"
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Target Topic / Angle</label>
            <input 
              type="text" 
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs focus:border-amber-500 outline-none"
              placeholder="e.g. Bitcoin DCA vs Lump Sum"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Target Audience Persona</label>
            <input 
              type="text" 
              value={audienceInput}
              onChange={e => setAudienceInput(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs focus:border-amber-500 outline-none"
              placeholder="e.g. retail crypto holders"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateFresh}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all uppercase tracking-wide"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate 7 Viral Hooks
            </button>
          </div>
        </div>
      </div>

      {/* Hooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {generatedHooks.map((hook, idx) => (
          <div 
            key={idx}
            className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${hook.badgeColor}`}>
                  {hook.badge}
                </span>

                <div className="flex items-center gap-1.5">
                  {hook.platforms.map((p, i) => (
                    <span key={i} className="text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded border border-gray-800 font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {hook.name}
              </h4>

              <div className="p-3 bg-black/80 border border-gray-800/80 rounded-xl font-mono text-xs text-amber-200/90 leading-relaxed">
                &ldquo;{hook.example}&rdquo;
              </div>

              <p className="text-[11px] text-gray-500 font-mono">
                Formula: <span className="text-gray-400">{hook.formula}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-gray-800/60 flex justify-between items-center">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> High CTR Retention
              </span>

              <button
                onClick={() => handleCopy(hook.example, idx)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Hook
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
