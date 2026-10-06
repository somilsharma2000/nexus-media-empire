"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Globe, Shield, Bot, Database, Radio, Share2, RefreshCw, 
  CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff, Save, Key, CreditCard, Sparkles, BarChart, Mail,
  Server, Play, Lock, Check, Cpu, CheckCheck, HelpCircle, Layers
} from "lucide-react";

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  isSecret?: boolean;
  help?: string;
}

interface ConnectionService {
  id: string;
  name: string;
  category: "Database" | "AI Engine" | "Monetization & Payments" | "SEO & Analytics" | "Email & Audience" | "Social & Alerts";
  icon: React.ReactNode;
  primaryKey: string;
  fields: FieldDef[];
  description: string;
  unlockedFeatures: string[];
  docsUrl: string;
  canBootstrapDb?: boolean;
}

const SERVICES: ConnectionService[] = [
  {
    id: "supabase",
    name: "Supabase / PostgreSQL Database",
    category: "Database",
    icon: <Database className="w-5 h-5 text-indigo-400" />,
    primaryKey: "DATABASE_URL",
    fields: [
      {
        key: "DATABASE_URL",
        label: "PostgreSQL Connection String (Pooler or Direct)",
        placeholder: "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true",
        isSecret: true,
        help: "Supabase -> Project Settings -> Database -> Connection string (URI)"
      }
    ],
    description: "Cloud relational database for persistent articles, live view counters, subscriber lists, and automated cron states.",
    unlockedFeatures: ["Persistent article storage", "Zero ephemeral resets on redeploy", "Real-time view count tracking", "Atomic customer checkouts"],
    docsUrl: "https://supabase.com/dashboard",
    canBootstrapDb: true,
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o-mini & GPT-4o",
    category: "AI Engine",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    primaryKey: "OPENAI_API_KEY",
    fields: [
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API Secret Key",
        placeholder: "sk-proj-...",
        isSecret: true,
        help: "platform.openai.com/api-keys"
      },
      {
        key: "MAX_MONTHLY_AI_BUDGET",
        label: "Monthly AI Budget Cap (USD)",
        placeholder: "30",
        help: "Hard safety spending cap in USD per month"
      }
    ],
    description: "Powers the autonomous content generator, 5-dimension QA reviewer gate, and AI Content Doctor.",
    unlockedFeatures: ["Autonomous 1,500-word SEO articles", "5-Dimension editorial grading", "Automated FAQ schema generation", "Content refresher doctor"],
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude (Sonnet / Haiku)",
    category: "AI Engine",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    primaryKey: "ANTHROPIC_API_KEY",
    fields: [
      {
        key: "ANTHROPIC_API_KEY",
        label: "Anthropic API Key",
        placeholder: "sk-ant-api03-...",
        isSecret: true,
        help: "console.anthropic.com/settings/keys"
      }
    ],
    description: "High-reasoning alternative model for deep financial analysis, investigative journalism, and humanized tone polishing.",
    unlockedFeatures: ["Nuanced financial analysis", "Zero robotic AI clichés", "Advanced multi-turn fact verification"],
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM AI Platform",
    category: "AI Engine",
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    primaryKey: "NVIDIA_API_KEY",
    fields: [
      {
        key: "NVIDIA_API_KEY",
        label: "NVIDIA NIM API Key",
        placeholder: "nvapi-...",
        isSecret: true,
        help: "build.nvidia.com"
      },
      {
        key: "NVIDIA_MODEL",
        label: "Model Name",
        placeholder: "meta/llama-3.3-70b-instruct",
        help: "Default: meta/llama-3.3-70b-instruct"
      }
    ],
    description: "Ultra high-speed open-weights inference (Llama-3.3 70B) for instant batch article generation with zero rate limit throttling.",
    unlockedFeatures: ["Zero rate limits", "Sub-second generation latency", "Enterprise-grade uptime"],
    docsUrl: "https://build.nvidia.com",
  },
  {
    id: "razorpay",
    name: "Razorpay Gateway",
    category: "Monetization & Payments",
    icon: <CreditCard className="w-5 h-5 text-blue-400" />,
    primaryKey: "RAZORPAY_KEY_ID",
    fields: [
      {
        key: "RAZORPAY_KEY_ID",
        label: "Key ID",
        placeholder: "rzp_live_... or rzp_test_...",
        isSecret: false,
        help: "Razorpay Dashboard -> Settings -> API Keys"
      },
      {
        key: "RAZORPAY_KEY_SECRET",
        label: "Key Secret",
        placeholder: "Razorpay Secret Key",
        isSecret: true,
        help: "Secret generated alongside Key ID"
      },
      {
        key: "RAZORPAY_WEBHOOK_SECRET",
        label: "Webhook Secret (Optional)",
        placeholder: "webhook_secret_...",
        isSecret: true,
        help: "Webhook signing secret for instant order fulfillment"
      }
    ],
    description: "Instant UPI, Credit Card, and Netbanking payments for digital products, cheatsheets, and sponsorship packages.",
    unlockedFeatures: ["Instant 1-click UPI & Card checkout", "Automated digital asset delivery", "Real-time webhook order verification"],
    docsUrl: "https://dashboard.razorpay.com/app/keys",
  },
  {
    id: "adsense",
    name: "Google AdSense & Ad Exchanges",
    category: "Monetization & Payments",
    icon: <Globe className="w-5 h-5 text-green-400" />,
    primaryKey: "NEXT_PUBLIC_ADSENSE_CLIENT",
    fields: [
      {
        key: "NEXT_PUBLIC_ADSENSE_CLIENT",
        label: "AdSense Publisher ID",
        placeholder: "pub-0000000000000000",
        help: "adsense.google.com -> Account Information"
      },
      {
        key: "GOOGLE_ADSENSE_CLIENT_ID",
        label: "AdSense API Client ID (Optional)",
        placeholder: "For real-time RPM telemetry sync",
        help: "Google Cloud Console OAuth Client"
      },
      {
        key: "GOOGLE_ADSENSE_CLIENT_SECRET",
        label: "AdSense API Client Secret (Optional)",
        placeholder: "AdSense OAuth Secret",
        isSecret: true
      }
    ],
    description: "Serves programmatic responsive ads across all network niches with automated ad-block detection and global kill-switch.",
    unlockedFeatures: ["Automated header & mid-feed ads", "Dynamic ads.txt sync", "Real-time RPM calculation"],
    docsUrl: "https://adsense.google.com",
  },
  {
    id: "gsc",
    name: "Google Search Console & IndexNow",
    category: "SEO & Analytics",
    icon: <Globe className="w-5 h-5 text-purple-400" />,
    primaryKey: "GOOGLE_INDEXING_API_KEY",
    fields: [
      {
        key: "GOOGLE_INDEXING_API_KEY",
        label: "Google Indexing API Key / JSON Key",
        placeholder: "Service account private key or IndexNow token",
        isSecret: true,
        help: "Google Cloud Console -> Service Account for Indexing API"
      },
      {
        key: "INDEXNOW_KEY",
        label: "IndexNow API Key (Bing / Yandex)",
        placeholder: "32-character IndexNow key",
        isSecret: true,
        help: "indexnow.org"
      },
      {
        key: "NEXT_PUBLIC_SITE_URL",
        label: "Production Canonical Site URL",
        placeholder: "https://nexus-media-empire.vercel.app",
        help: "Used for sitemap.xml, robots.txt, and JSON-LD schema tags"
      }
    ],
    description: "Submits newly published articles to Google, Bing, and DuckDuckGo search engines within seconds of release.",
    unlockedFeatures: ["Sub-minute search crawling", "Automated sitemap queueing", "SERP ranking telemetry"],
    docsUrl: "https://search.google.com/search-console",
  },
  {
    id: "ga4",
    name: "Google Analytics 4 (GA4)",
    category: "SEO & Analytics",
    icon: <BarChart className="w-5 h-5 text-amber-400" />,
    primaryKey: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    fields: [
      {
        key: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
        label: "GA4 Measurement ID",
        placeholder: "G-XXXXXXXXXX",
        help: "analytics.google.com -> Admin -> Data Streams"
      }
    ],
    description: "Collects verified Tier 1 reader metrics, scroll depth, and bounce rate data for high-paying ad network applications.",
    unlockedFeatures: ["Real-time active visitors", "Tier-1 geography breakdown", "Mediavine & Raptive compliance proof"],
    docsUrl: "https://analytics.google.com",
  },
  {
    id: "beehiiv",
    name: "Beehiiv Newsletter & Email Flywheel",
    category: "Email & Audience",
    icon: <Mail className="w-5 h-5 text-indigo-400" />,
    primaryKey: "BEEHIIV_API_KEY",
    fields: [
      {
        key: "BEEHIIV_API_KEY",
        label: "Beehiiv API Key",
        placeholder: "beehiiv_api_...",
        isSecret: true,
        help: "app.beehiiv.com/settings/api"
      },
      {
        key: "BEEHIIV_PUBLICATION_ID",
        label: "Publication ID",
        placeholder: "pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        help: "Found in your Beehiiv publication settings"
      },
      {
        key: "RESEND_API_KEY",
        label: "Resend API Key (Direct Transactional)",
        placeholder: "re_xxxxxxxx_...",
        isSecret: true,
        help: "resend.com/api-keys for instant invoice delivery"
      }
    ],
    description: "Captures lead magnet and newsletter subscribers and automatically syncs them into your Beehiiv email lists.",
    unlockedFeatures: ["Automated subscriber capture", "1-Click weekly broadcast digests", "Direct transactional email delivery"],
    docsUrl: "https://app.beehiiv.com/settings/api",
  },
  {
    id: "telegram",
    name: "Telegram Bot Command & Alerts",
    category: "Social & Alerts",
    icon: <Bot className="w-5 h-5 text-cyan-400" />,
    primaryKey: "TELEGRAM_BOT_TOKEN",
    fields: [
      {
        key: "TELEGRAM_BOT_TOKEN",
        label: "Telegram Bot Token",
        placeholder: "1234567890:AAF...",
        isSecret: true,
        help: "Obtain from @BotFather on Telegram"
      },
      {
        key: "TELEGRAM_ADMIN_USER_ID",
        label: "Your Telegram User ID",
        placeholder: "123456789",
        help: "Get from @userinfobot on Telegram"
      },
      {
        key: "ALERT_WEBHOOK_URL",
        label: "Discord / Slack Webhook URL (Optional)",
        placeholder: "https://discord.com/api/webhooks/...",
        help: "Optional backup channel for critical downtime alarms"
      }
    ],
    description: "Control the entire media empire from your smartphone: check revenues, pause pipelines, and approve articles via Telegram.",
    unlockedFeatures: ["/status, /pause, /resume commands", "1-Tap article approval buttons", "Instant uptime & failure alerts"],
    docsUrl: "https://t.me/BotFather",
  },
  {
    id: "twitter",
    name: "Twitter / X Auto-Publishing",
    category: "Social & Alerts",
    icon: <Share2 className="w-5 h-5 text-blue-400" />,
    primaryKey: "TWITTER_API_KEY",
    fields: [
      {
        key: "TWITTER_API_KEY",
        label: "API Key (Consumer Key)",
        placeholder: "Twitter API Key",
        isSecret: true,
        help: "developer.twitter.com/en/portal/dashboard"
      },
      {
        key: "TWITTER_API_SECRET",
        label: "API Key Secret",
        placeholder: "Twitter API Secret",
        isSecret: true
      },
      {
        key: "TWITTER_ACCESS_TOKEN",
        label: "Access Token",
        placeholder: "OAuth 1.0a User Access Token",
        isSecret: true
      },
      {
        key: "TWITTER_ACCESS_SECRET",
        label: "Access Token Secret",
        placeholder: "OAuth 1.0a Access Token Secret",
        isSecret: true
      }
    ],
    description: "Automatically threads published articles into high-engagement viral tweets on X with rich formatting and CTA hooks.",
    unlockedFeatures: ["Zero-touch thread publishing", "Viral hook distribution", "Social referral tracking"],
    docsUrl: "https://developer.twitter.com",
  },
  {
    id: "reddit",
    name: "Reddit & Medium Syndication",
    category: "Social & Alerts",
    icon: <Radio className="w-5 h-5 text-orange-400" />,
    primaryKey: "REDDIT_CLIENT_ID",
    fields: [
      {
        key: "REDDIT_CLIENT_ID",
        label: "Reddit App Client ID",
        placeholder: "Reddit Script App Client ID",
        help: "reddit.com/prefs/apps"
      },
      {
        key: "REDDIT_CLIENT_SECRET",
        label: "Reddit Client Secret",
        placeholder: "Reddit App Secret",
        isSecret: true
      },
      {
        key: "REDDIT_USERNAME",
        label: "Reddit Username",
        placeholder: "Your Reddit Bot Account"
      },
      {
        key: "REDDIT_PASSWORD",
        label: "Reddit Password",
        placeholder: "Reddit Account Password",
        isSecret: true
      },
      {
        key: "MEDIUM_TOKEN",
        label: "Medium Integration Token",
        placeholder: "Integration Token from medium.com/me/settings",
        isSecret: true
      }
    ],
    description: "Cross-publishes article summaries and canonical-tagged backlinks to high-authority Reddit communities and Medium publications.",
    unlockedFeatures: ["High DA backlink generation", "Organic niche traffic spikes", "Automated Medium syndication"],
    docsUrl: "https://www.reddit.com/prefs/apps",
  }
];

const CATEGORIES = [
  "All Connections",
  "Database",
  "AI Engine",
  "Monetization & Payments",
  "SEO & Analytics",
  "Email & Audience",
  "Social & Alerts"
] as const;

export default function ConnectionsHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Connections");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [savingService, setSavingService] = useState<string | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [globalBanner, setGlobalBanner] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

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

  const handleToggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showBanner = (message: string, type: "success" | "error" | "info" = "success") => {
    setGlobalBanner({ message, type });
    setTimeout(() => setGlobalBanner(null), 6000);
  };

  // 1. Save single service fields
  const handleSaveService = async (service: ConnectionService) => {
    setSavingService(service.id);
    const payload: Record<string, string> = {};
    for (const f of service.fields) {
      payload[f.key] = inputValues[f.key] || "";
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showBanner(`✅ ${service.name} configuration saved & activated in runtime memory!`, "success");
      } else {
        showBanner(`❌ Failed to save ${service.name} settings`, "error");
      }
    } catch (err: any) {
      showBanner(`Error: ${err.message || "Network failure"}`, "error");
    } finally {
      setSavingService(null);
    }
  };

  // 2. Test single service connection
  const handleTestService = async (service: ConnectionService) => {
    setTestingService(service.id);
    const primaryVal = inputValues[service.primaryKey] || "";
    const extraVal = service.fields[1] ? inputValues[service.fields[1].key] : undefined;

    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service.id,
          value: primaryVal,
          extra: extraVal
        }),
      });

      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [service.id]: {
          success: Boolean(data.success),
          message: data.message || (data.success ? "Test Passed!" : "Test Failed"),
          latencyMs: data.latencyMs
        }
      }));

      if (data.success) {
        showBanner(`✨ ${service.name} Test Passed! ${data.message}`, "success");
      } else {
        showBanner(`⚠️ ${service.name} Test Failed: ${data.message}`, "error");
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [service.id]: {
          success: false,
          message: err.message || "Network test failed"
        }
      }));
      showBanner(`Test error for ${service.name}`, "error");
    } finally {
      setTestingService(null);
    }
  };

  // 3. Save All Credentials at once
  const handleSaveAll = async () => {
    setSavingService("ALL");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputValues),
      });

      if (res.ok) {
        showBanner("🚀 All API connections & environment variables saved & activated!", "success");
      } else {
        showBanner("Failed to save global configurations", "error");
      }
    } catch (err: any) {
      showBanner(`Error: ${err.message}`, "error");
    } finally {
      setSavingService(null);
    }
  };

  // 4. Trigger Database Auto-Seed / Bootstrap
  const handleBootstrapDb = async () => {
    setIsBootstrapping(true);
    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`🎉 Database Seed Complete! Synced: ${data.summary?.articles || 90} Articles, ${data.summary?.topics || 5} Topics, ${data.summary?.products || 3} Digital Products, ${data.summary?.adslots || 3} Ad Slots`, "success");
      } else {
        showBanner(`Database sync failed: ${data.error || "Ensure DATABASE_URL is saved first"}`, "error");
      }
    } catch (err: any) {
      showBanner(`Bootstrap error: ${err.message}`, "error");
    } finally {
      setIsBootstrapping(false);
    }
  };

  const filteredServices = selectedCategory === "All Connections"
    ? SERVICES
    : SERVICES.filter((s) => s.category === selectedCategory);

  const totalConnected = SERVICES.filter((s) => Boolean(inputValues[s.primaryKey]?.trim())).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0b101d] via-[#080d18] to-[#04060c] border border-blue-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Nexus Unified API Hub
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {totalConnected} of {SERVICES.length} Integrations Connected
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Key className="w-7 h-7 text-blue-400" /> API &amp; Connection Command Center
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Configure, test, and save every API key, PostgreSQL connection string, payment gateway, and social bot token directly from this panel without redeploying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={savingService === "ALL"}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {savingService === "ALL" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save All Keys</span>
            </button>

            <button
              onClick={handleBootstrapDb}
              disabled={isBootstrapping || !inputValues["DATABASE_URL"]}
              title={!inputValues["DATABASE_URL"] ? "Save DATABASE_URL first to enable" : "Sync all 90 articles and configurations to PostgreSQL"}
              className="px-4 py-2.5 bg-gray-900/90 hover:bg-gray-800 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold rounded-xl border border-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            >
              {isBootstrapping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>Seed / Bootstrap DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Alert Banner */}
      {globalBanner && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between shadow-xl transition-all ${
          globalBanner.type === "success" 
            ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
            : globalBanner.type === "error"
            ? "bg-red-950/70 border-red-500/40 text-red-300"
            : "bg-blue-950/70 border-blue-500/40 text-blue-300"
        }`}>
          <div className="flex items-center gap-3">
            {globalBanner.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
            <span>{globalBanner.message}</span>
          </div>
          <button onClick={() => setGlobalBanner(null)} className="text-gray-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                active 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                  : "bg-[#090d16] text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-gray-800"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredServices.map((service) => {
          const isConfigured = Boolean(inputValues[service.primaryKey]?.trim());
          const isTesting = testingService === service.id;
          const isSaving = savingService === service.id;
          const testResult = testResults[service.id];

          return (
            <div 
              key={service.id}
              className={`p-6 rounded-3xl bg-[#080c16] border transition-all duration-200 flex flex-col justify-between shadow-lg ${
                isConfigured 
                  ? "border-gray-800/80 hover:border-blue-500/40" 
                  : "border-gray-800/50 hover:border-gray-700"
              }`}
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-inner">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {service.name}
                      </h3>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    {isConfigured ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gray-900 text-gray-400 border border-gray-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Unset
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {service.description}
                </p>

                {/* Input Fields */}
                <div className="space-y-3 pt-2">
                  {service.fields.map((field) => {
                    const isSecret = field.isSecret;
                    const isRevealed = revealed[field.key];
                    const val = inputValues[field.key] || "";

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono font-semibold text-gray-300 flex items-center gap-1.5">
                            <code>{field.key}</code>
                          </label>
                          {field.help && (
                            <span className="text-[10px] text-gray-500 font-mono">
                              {field.help}
                            </span>
                          )}
                        </div>

                        <div className="relative flex items-center">
                          <input
                            type={isSecret && !isRevealed ? "password" : "text"}
                            value={val}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#04070e] border border-gray-800 focus:border-blue-500/80 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 pr-10"
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => handleToggleReveal(field.key)}
                              className="absolute right-3 text-gray-500 hover:text-gray-300"
                              title={isRevealed ? "Hide secret" : "Show secret"}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Test Feedback Message if present */}
                {testResult && (
                  <div className={`p-3 rounded-xl border text-[11px] font-mono flex items-start gap-2 ${
                    testResult.success 
                      ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-300" 
                      : "bg-red-950/50 border-red-500/30 text-red-300"
                  }`}>
                    {testResult.success ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <span>{testResult.message}</span>
                      {testResult.latencyMs && (
                        <span className="block text-[9px] text-gray-400 mt-0.5">Roundtrip: {testResult.latencyMs}ms</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Unlocked Features List */}
                <div className="pt-2 border-t border-gray-800/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-1.5 font-bold">
                    Capabilities Unlocked:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {service.unlockedFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <CheckCheck className={`w-3.5 h-3.5 ${isConfigured ? "text-emerald-400" : "text-gray-600"}`} />
                        <span className={isConfigured ? "text-gray-300" : "text-gray-500"}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-5 mt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
                <a
                  href={service.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 group"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestService(service)}
                    disabled={isTesting}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Play className="w-3.5 h-3.5 text-blue-400" />}
                    <span>Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveService(service)}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save</span>
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
