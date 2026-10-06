"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Globe, Shield, Bot, Database, Radio, Share2, RefreshCw, 
  CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff, Save, Key, CreditCard, Sparkles 
} from "lucide-react";

interface ConnectionService {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  envKey: string;
  description: string;
  placeholder: string;
  unlockedFeatures: string[];
  docsUrl: string;
  isSecret?: boolean;
}

const SERVICES: ConnectionService[] = [
  {
    id: "openai",
    name: "OpenAI GPT-4o-mini",
    category: "AI Engine",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    envKey: "OPENAI_API_KEY",
    placeholder: "sk-proj-...",
    isSecret: true,
    description: "Powers autonomous multi-pass article generation, SEO metadata, and AI quality reviewer gate.",
    unlockedFeatures: ["Autonomous 1500-word generation", "AI self-reviewer scoring", "GEO-optimized formatting"],
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude (Sonnet / Haiku)",
    category: "AI Engine",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    envKey: "ANTHROPIC_API_KEY",
    placeholder: "sk-ant-api03-...",
    isSecret: true,
    description: "High-reasoning alternative model for deep technical analysis and editorial polishing.",
    unlockedFeatures: ["Nuanced humanized prose", "Zero AI robotic clichés", "Deep fact-checking"],
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "adsense",
    name: "Google AdSense",
    category: "Monetization",
    icon: <Globe className="w-5 h-5 text-green-400" />,
    envKey: "NEXT_PUBLIC_ADSENSE_CLIENT",
    placeholder: "pub-0000000000000000",
    description: "Serves programmatic responsive ads across The Trend Matrix, Crypto Daily, and Wall St Insider.",
    unlockedFeatures: ["Automated ad unit injection", "RPM tracking & sync", "Global kill-switch protection"],
    docsUrl: "https://adsense.google.com",
  },
  {
    id: "telegram",
    name: "Telegram Bot Token",
    category: "Mobile Control",
    icon: <Bot className="w-5 h-5 text-cyan-400" />,
    envKey: "TELEGRAM_BOT_TOKEN",
    placeholder: "1234567890:AAF...",
    isSecret: true,
    description: "Receive real-time alerts, review QA rejections, and pause/resume pipelines directly from your phone.",
    unlockedFeatures: ["/status, /pause, /resume commands", "Inline 1-tap article approvals", "Instant downtime alerts"],
    docsUrl: "https://t.me/BotFather",
  },
  {
    id: "supabase",
    name: "Supabase PostgreSQL",
    category: "Database",
    icon: <Database className="w-5 h-5 text-indigo-400" />,
    envKey: "DATABASE_URL",
    placeholder: "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres",
    isSecret: true,
    description: "Cloud relational database for persistent multi-tenant articles, logs, and revenue analytics.",
    unlockedFeatures: ["Multi-region replication", "Persistent article database", "Direct SQL analytics"],
    docsUrl: "https://supabase.com",
  },
  {
    id: "indexnow",
    name: "Google & IndexNow Protocol",
    category: "Search & SEO",
    icon: <Globe className="w-5 h-5 text-purple-400" />,
    envKey: "INDEXNOW_KEY",
    placeholder: "indexnow-key-or-google-api-key",
    isSecret: true,
    description: "Pings search crawlers (Bing, DuckDuckGo, Yandex, Google) within 5 seconds of publishing.",
    unlockedFeatures: ["Instant crawler submission", "Search rank telemetry", "Sitemap priority boosting"],
    docsUrl: "https://www.indexnow.org/",
  },
  {
    id: "twitter",
    name: "Twitter / X API",
    category: "Social Distribution",
    icon: <Share2 className="w-5 h-5 text-blue-400" />,
    envKey: "TWITTER_API_KEY",
    placeholder: "API Key / Bearer Token",
    isSecret: true,
    description: "Automatically schedules and publishes high-engagement 6-tweet threads when articles go live.",
    unlockedFeatures: ["Zero-touch thread publishing", "Viral audience funneling", "Social referral tracking"],
    docsUrl: "https://developer.twitter.com",
  },
  {
    id: "reddit",
    name: "Reddit Distribution API",
    category: "Social Distribution",
    icon: <Radio className="w-5 h-5 text-orange-400" />,
    envKey: "REDDIT_CLIENT_ID",
    placeholder: "Reddit App Client ID",
    description: "Dispatches authoritative summaries into niche subreddits (r/technology, r/CryptoCurrency).",
    unlockedFeatures: ["Targeted community distribution", "High organic backlink weight", "Referral spikes"],
    docsUrl: "https://www.reddit.com/prefs/apps",
  },
  {
    id: "payments",
    name: "Razorpay / Stripe Gateways",
    category: "Payment Processing",
    icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    envKey: "RAZORPAY_KEY_ID",
    placeholder: "rzp_live_... or sk_live_...",
    isSecret: true,
    description: "Processes digital passes, SaaS subscriptions, and client asset checkouts automatically.",
    unlockedFeatures: ["UPI & Card payments", "Automated webhook fulfillment", "Zero-friction checkout"],
    docsUrl: "https://dashboard.razorpay.com",
  },
];

export default function ConnectionsHub() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Load existing credentials on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setInputValues(data || {});
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  const handleInputChange = (key: string, val: string) => {
    setInputValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveSingle = async (service: ConnectionService) => {
    const val = inputValues[service.envKey] || "";
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [service.envKey]: val }),
      });
      if (res.ok) {
        setSavedStatus((prev) => ({ ...prev, [service.id]: true }));
        setFeedback({ id: service.id, msg: `Saved and synchronized to .env!`, success: true });
        setTimeout(() => setSavedStatus((prev) => ({ ...prev, [service.id]: false })), 3000);
      } else {
        setFeedback({ id: service.id, msg: `Failed to save ${service.name}`, success: false });
      }
    } catch {
      setFeedback({ id: service.id, msg: "Network error saving key", success: false });
    }
  };

  const handleSaveAll = async () => {
    setIsBulkSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputValues),
      });
      if (res.ok) {
        setBannerMsg("All API keys and credentials successfully saved to runtime and .env!");
        setTimeout(() => setBannerMsg(null), 4000);
      }
    } catch {
      setBannerMsg("Error saving credentials to server.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleTestConnection = async (s: ConnectionService) => {
    setTestingService(s.id);
    setFeedback(null);
    const value = inputValues[s.envKey];

    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: s.id, value }),
      });
      const data = await res.json();
      setFeedback({ id: s.id, msg: data.message, success: data.success });
    } catch (e: any) {
      setFeedback({ id: s.id, msg: e.message || "Failed to reach test server", success: false });
    } finally {
      setTestingService(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-black border border-blue-900/40 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>EXECUTIVE CREDENTIALS & API VAULT</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Account Connections & Live Integrations
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Enter your API credentials here. When saved, keys are automatically synchronized directly into <code className="text-blue-400 font-mono">.env</code> and runtime memory so your autonomous engines start working immediately without server restarts.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isBulkSaving}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          {isBulkSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Credentials</span>
        </button>
      </div>

      {bannerMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-2xl text-xs font-mono flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Grid of Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((s) => {
          const rawVal = inputValues[s.envKey] || "";
          const isConfigured = Boolean(rawVal.trim());
          const isShowingSecret = revealed[s.id];

          return (
            <div
              key={s.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isConfigured
                  ? "bg-[#080d17] border-blue-900/50 hover:border-blue-700/60 shadow-lg shadow-blue-950/20"
                  : "bg-gray-950/60 border-gray-800/80 hover:border-gray-700"
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-800">{s.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{s.category}</span>
                    </div>
                  </div>

                  <div>
                    {isConfigured ? (
                      <span className="px-2.5 py-1 bg-emerald-950/50 text-emerald-400 text-[11px] font-mono font-semibold rounded-full border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-950/40 text-amber-400 text-[11px] font-mono font-semibold rounded-full border border-amber-800/40 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Needs Key
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{s.description}</p>

                {/* Direct Key Input Section */}
                <div className="mt-4 pt-3 border-t border-gray-850">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-400 block mb-1">
                    Environment Key: <code className="text-blue-400">{s.envKey}</code>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={s.isSecret && !isShowingSecret ? "password" : "text"}
                      value={rawVal}
                      onChange={(e) => handleInputChange(s.envKey, e.target.value)}
                      placeholder={s.placeholder}
                      className="w-full px-3 py-2 text-xs bg-black/60 border border-gray-800 focus:border-blue-500 rounded-xl text-white font-mono placeholder-gray-600 focus:outline-none transition-colors pr-10"
                    />
                    {s.isSecret && (
                      <button
                        type="button"
                        onClick={() => setRevealed((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                        className="absolute right-3 text-gray-500 hover:text-gray-300 text-xs"
                      >
                        {isShowingSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Capabilities list */}
                <div className="mt-3">
                  <ul className="space-y-1">
                    {s.unlockedFeatures.map((feat, idx) => (
                      <li key={idx} className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live Feedback */}
                {feedback && feedback.id === s.id && (
                  <div
                    className={`mt-3 p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      feedback.success
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                        : "bg-red-950/60 text-red-300 border border-red-800/60"
                    }`}
                  >
                    {feedback.success ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{feedback.msg}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-900 flex items-center justify-between gap-3">
                <a
                  href={s.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Get API Keys
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveSingle(s)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 border border-gray-700 transition-colors"
                  >
                    <Save className="w-3 h-3 text-emerald-400" />
                    <span>{savedStatus[s.id] ? "Saved!" : "Save"}</span>
                  </button>

                  <button
                    onClick={() => handleTestConnection(s)}
                    disabled={testingService === s.id}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingService === s.id ? "animate-spin" : ""}`} />
                    <span>Test Sync</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
