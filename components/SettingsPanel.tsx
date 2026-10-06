"use client";

import { useState, useEffect } from "react";
import { 
  Eye, EyeOff, Save, CheckCircle, AlertCircle, Copy, RefreshCw, Key, Bot, Database, Globe, Zap, Shield, Sparkles, CreditCard, Mail, Share2, Radio, Check
} from "lucide-react";

interface Setting {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  isSecret?: boolean;
  required?: boolean;
  helpUrl?: string;
  generateable?: boolean;
}

const SETTING_GROUPS: { title: string; icon: React.ReactNode; color: string; settings: Setting[] }[] = [
  {
    title: "Database & Cloud Infrastructure",
    icon: <Database className="w-5 h-5 text-indigo-400" />,
    color: "blue",
    settings: [
      {
        key: "DATABASE_URL",
        label: "PostgreSQL Database Connection URI",
        description: "Supabase or PostgreSQL pooled URI. Stores all articles, view counters, subscribers, and cron states.",
        placeholder: "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true",
        isSecret: true,
        required: true,
        helpUrl: "https://supabase.com",
      },
    ],
  },
  {
    title: "AI Generation & Quality Gate",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    color: "yellow",
    settings: [
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API Secret Key",
        description: "Powers autonomous article generation, FAQ structuring, and 5-dimension QA self-review.",
        placeholder: "sk-proj-...",
        isSecret: true,
        required: false,
        helpUrl: "https://platform.openai.com/api-keys",
      },
      {
        key: "ANTHROPIC_API_KEY",
        label: "Anthropic API Key (Claude)",
        description: "Optional model for long-form deep dives and editorial polishing.",
        placeholder: "sk-ant-api03-...",
        isSecret: true,
        required: false,
        helpUrl: "https://console.anthropic.com/settings/keys",
      },
      {
        key: "NVIDIA_API_KEY",
        label: "NVIDIA AI Key (High-Throughput NIM)",
        description: "Alternative zero-rate-limit high throughput inference via NVIDIA NIM.",
        placeholder: "nvapi-...",
        isSecret: true,
        required: false,
        helpUrl: "https://build.nvidia.com",
      },
      {
        key: "MAX_MONTHLY_AI_BUDGET",
        label: "Monthly AI Budget Cap (USD)",
        description: "Hard cap on LLM API spend per month. Pipeline automatically pauses when reached.",
        placeholder: "30",
        required: false,
      },
    ],
  },
  {
    title: "Admin Security & Clearance",
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    color: "green",
    settings: [
      {
        key: "AUTH_SECRET",
        label: "NextAuth Authentication Secret",
        description: "Cryptographic string used to sign admin session cookies and JWT clearance tokens.",
        placeholder: "64-character-hex-or-random-crypto-string",
        isSecret: true,
        required: true,
        generateable: true,
      },
      {
        key: "ADMIN_EMAIL",
        label: "Admin Login Email",
        description: "Primary master operator email address for admin login.",
        placeholder: "admin@nexus.com",
        required: true,
      },
      {
        key: "ADMIN_PASSWORD_HASH",
        label: "Admin Password Hash (bcrypt)",
        description: "bcrypt hash of your admin password. Type a password below to generate hash.",
        placeholder: "$2b$10$...",
        isSecret: true,
        required: true,
        generateable: true,
      },
      {
        key: "CRON_SECRET",
        label: "Cron Secret Key",
        description: "Secures all automated background pipeline endpoints (/api/pipeline/*, /api/monitor/*).",
        placeholder: "nexus-cron-secret-2026",
        isSecret: true,
        required: true,
        generateable: true,
      },
    ],
  },
  {
    title: "Monetization & Payment Gateways",
    icon: <CreditCard className="w-5 h-5 text-blue-400" />,
    color: "cyan",
    settings: [
      {
        key: "RAZORPAY_KEY_ID",
        label: "Razorpay Key ID",
        description: "Public key for 1-click UPI and Card payments on digital downloads & sponsors.",
        placeholder: "rzp_live_... or rzp_test_...",
        required: false,
        helpUrl: "https://dashboard.razorpay.com",
      },
      {
        key: "RAZORPAY_KEY_SECRET",
        label: "Razorpay Key Secret",
        description: "Secret key for verifying payment signatures and webhook orders.",
        placeholder: "Razorpay Secret Key",
        isSecret: true,
        required: false,
      },
      {
        key: "RAZORPAY_WEBHOOK_SECRET",
        label: "Razorpay Webhook Secret",
        description: "Used to authenticate automated webhook callbacks for digital product fulfillment.",
        placeholder: "webhook_secret_...",
        isSecret: true,
        required: false,
      },
      {
        key: "NEXT_PUBLIC_ADSENSE_CLIENT",
        label: "Google AdSense Publisher ID",
        description: "Your pub-XXXXXXXXXXXXXXXX ID from AdSense. Required for programmatic display ads.",
        placeholder: "pub-0000000000000000",
        required: false,
        helpUrl: "https://adsense.google.com",
      },
    ],
  },
  {
    title: "SEO, Indexing & Canonical Domain",
    icon: <Globe className="w-5 h-5 text-purple-400" />,
    color: "purple",
    settings: [
      {
        key: "NEXT_PUBLIC_SITE_URL",
        label: "Canonical Live Production URL",
        description: "Production domain (e.g. https://nexus-media-empire.vercel.app). Used in sitemap.xml and schema.",
        placeholder: "https://nexus-media-empire.vercel.app",
        required: false,
      },
      {
        key: "GOOGLE_INDEXING_API_KEY",
        label: "Google Indexing API / JSON Credentials",
        description: "Service account private key for instant Googlebot crawling.",
        placeholder: "AIza... or private key",
        isSecret: true,
        required: false,
      },
      {
        key: "INDEXNOW_KEY",
        label: "IndexNow API Key (Bing / Yandex)",
        description: "API key for sub-minute IndexNow submission on new articles.",
        placeholder: "IndexNow API Key",
        isSecret: true,
        required: false,
      },
      {
        key: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
        label: "Google Analytics 4 Measurement ID",
        description: "Tracks active readers and Tier-1 audience geographic breakdown.",
        placeholder: "G-XXXXXXXXXX",
        required: false,
      },
    ],
  },
  {
    title: "Email Newsletter & Flywheel",
    icon: <Mail className="w-5 h-5 text-indigo-400" />,
    color: "blue",
    settings: [
      {
        key: "BEEHIIV_API_KEY",
        label: "Beehiiv Newsletter API Key",
        description: "Syncs article subscribers directly into Beehiiv publication audiences.",
        placeholder: "beehiiv_api_...",
        isSecret: true,
        required: false,
        helpUrl: "https://app.beehiiv.com/settings/api",
      },
      {
        key: "BEEHIIV_PUBLICATION_ID",
        label: "Beehiiv Publication ID",
        description: "Target publication UUID for incoming subscribers.",
        placeholder: "pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        required: false,
      },
      {
        key: "RESEND_API_KEY",
        label: "Resend API Key",
        description: "High-deliverability transactional email delivery for invoices and digital downloads.",
        placeholder: "re_xxxxxxxx_...",
        isSecret: true,
        required: false,
        helpUrl: "https://resend.com",
      },
    ],
  },
  {
    title: "Telegram Bot & Instant Alarms",
    icon: <Bot className="w-5 h-5 text-cyan-400" />,
    color: "cyan",
    settings: [
      {
        key: "TELEGRAM_BOT_TOKEN",
        label: "Telegram Bot Token",
        description: "From @BotFather. Enables full smartphone management and instant alarm notifications.",
        placeholder: "1234567890:AAF...",
        isSecret: true,
        required: false,
        helpUrl: "https://t.me/BotFather",
      },
      {
        key: "TELEGRAM_ADMIN_USER_ID",
        label: "Telegram Operator User ID",
        description: "Obtained from @userinfobot. Locks bot commands exclusively to your account.",
        placeholder: "123456789",
        required: false,
      },
      {
        key: "ALERT_WEBHOOK_URL",
        label: "Emergency Webhook URL (Discord / Slack)",
        description: "Secondary channel for critical failover notifications.",
        placeholder: "https://discord.com/api/webhooks/...",
        required: false,
      },
    ],
  },
  {
    title: "Social Media Auto-Publishing",
    icon: <Share2 className="w-5 h-5 text-blue-400" />,
    color: "blue",
    settings: [
      {
        key: "TWITTER_API_KEY",
        label: "Twitter/X API Key",
        description: "Consumer Key for automated tweet-thread posting.",
        placeholder: "Twitter API Key",
        isSecret: true,
        required: false,
      },
      {
        key: "TWITTER_API_SECRET",
        label: "Twitter/X API Secret",
        description: "Consumer Secret for Twitter API.",
        placeholder: "Twitter API Secret",
        isSecret: true,
        required: false,
      },
      {
        key: "TWITTER_ACCESS_TOKEN",
        label: "Twitter/X Access Token",
        description: "User Access Token for Twitter OAuth 1.0a.",
        placeholder: "Twitter Access Token",
        isSecret: true,
        required: false,
      },
      {
        key: "TWITTER_ACCESS_SECRET",
        label: "Twitter/X Access Token Secret",
        description: "User Access Token Secret for Twitter OAuth.",
        placeholder: "Twitter Access Secret",
        isSecret: true,
        required: false,
      },
      {
        key: "REDDIT_CLIENT_ID",
        label: "Reddit App Client ID",
        description: "Script App Client ID for posting to niche subreddits.",
        placeholder: "Reddit Client ID",
        required: false,
      },
      {
        key: "REDDIT_CLIENT_SECRET",
        label: "Reddit App Client Secret",
        description: "Secret associated with Reddit Script App.",
        placeholder: "Reddit Client Secret",
        isSecret: true,
        required: false,
      },
      {
        key: "MEDIUM_TOKEN",
        label: "Medium Integration Token",
        description: "Token for automatic cross-posting to Medium with canonical backlinks.",
        placeholder: "Medium Integration Token",
        isSecret: true,
        required: false,
      },
    ],
  },
];

function generateSecret(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SettingsPanel() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [passwordInput, setPasswordInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Load existing credentials from server API on mount
  useEffect(() => {
    async function fetchServerSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setValues(data || {});
        }
      } catch (err) {
        console.error("Failed to load settings from server:", err);
      }
    }
    fetchServerSettings();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveSingle = async (key: string) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: values[key] || "" }),
      });
      if (res.ok) {
        setSaved((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
        showToast(`✅ ${key} saved & activated in runtime memory`);
      } else {
        showToast(`Failed to save ${key}`, "error");
      }
    } catch {
      showToast(`Error saving ${key}`, "error");
    }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        showToast("🚀 All settings and API keys successfully saved & activated!");
      } else {
        showToast("Save failed — check server response", "error");
      }
    } catch {
      showToast("Network failure saving settings", "error");
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleGenerate = (key: string) => {
    if (key === "AUTH_SECRET") {
      const secret = generateSecret(48);
      setValues((prev) => ({ ...prev, [key]: secret }));
      showToast("Generated new 48-char AUTH_SECRET — click Save to apply");
    } else if (key === "CRON_SECRET") {
      const secret = "nexus-" + generateSecret(24);
      setValues((prev) => ({ ...prev, [key]: secret }));
      showToast("Generated new CRON_SECRET — click Save to apply");
    }
  };

  const handleHashPassword = async () => {
    if (!passwordInput.trim()) {
      showToast("Enter a password to hash", "error");
      return;
    }
    setIsHashing(true);
    try {
      const res = await fetch("/api/settings/hash-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.hash) {
        setHashResult(data.hash);
        setValues((prev) => ({ ...prev, ADMIN_PASSWORD_HASH: data.hash }));
        showToast("Password hashed with bcrypt and assigned to ADMIN_PASSWORD_HASH!");
      } else {
        showToast(data.error || "Hash generation failed", "error");
      }
    } catch {
      showToast("Failed to hash password", "error");
    } finally {
      setIsHashing(false);
    }
  };

  const copyToClipboard = (text: string, label = "Value") => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-mono flex items-center gap-2 backdrop-blur-xl ${
          toast.type === "error" ? "bg-red-950/90 border-red-500/50 text-red-300" : "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#090d18] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" /> Environment Settings &amp; Secrets Manager
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            Live master settings repository. Values saved here are persisted to the database and updated in runtime server process memory instantly.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSavingAll}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSavingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Password Hasher Helper Tool Card */}
      <div className="p-5 rounded-2xl bg-[#0b101c] border border-emerald-900/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
          <Shield className="w-4 h-4" />
          <span>Bcrypt Admin Password Hasher Tool</span>
        </div>
        <p className="text-xs text-gray-400">
          Set a new admin password by typing plaintext here. It will generate a cryptographic 10-round bcrypt hash and set <code className="text-emerald-300">ADMIN_PASSWORD_HASH</code>.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            placeholder="Type new admin password (e.g. MySuperSecretPass2026!)"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="flex-1 bg-[#050811] border border-gray-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none w-full"
          />
          <button
            onClick={handleHashPassword}
            disabled={isHashing}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isHashing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            <span>Generate &amp; Apply Hash</span>
          </button>
        </div>
        {hashResult && (
          <div className="p-3 bg-[#04060c] border border-emerald-800/40 rounded-xl flex items-center justify-between text-[11px] font-mono text-emerald-300">
            <span className="truncate mr-2">Hash: {hashResult}</span>
            <button onClick={() => copyToClipboard(hashResult, "Password Hash")} className="hover:text-white shrink-0">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Setting Groups */}
      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <div key={group.title} className="p-6 rounded-2xl bg-[#080c16] border border-gray-800/80 space-y-4 shadow-lg">
            
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-800/60">
              {group.icon}
              <h3 className="text-sm font-bold text-white tracking-wide">{group.title}</h3>
            </div>

            <div className="space-y-4">
              {group.settings.map((s) => {
                const isSecret = s.isSecret;
                const isRevealed = revealed[s.key];
                const isKeySaved = saved[s.key];
                const val = values[s.key] || "";

                return (
                  <div key={s.key} className="space-y-1.5 bg-[#050812] p-4 rounded-xl border border-gray-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold font-mono text-gray-200">
                          {s.label}
                        </label>
                        {s.required && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-400 border border-amber-800/40">
                            Required
                          </span>
                        )}
                      </div>

                      {s.helpUrl && (
                        <a
                          href={s.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-mono"
                        >
                          Get credential →
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {s.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <input
                          type={isSecret && !isRevealed ? "password" : "text"}
                          value={val}
                          onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                          placeholder={s.placeholder}
                          className="w-full bg-[#03050a] border border-gray-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-700 focus:outline-none pr-10"
                        />
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => setRevealed((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {s.generateable && (
                        <button
                          type="button"
                          onClick={() => handleGenerate(s.key)}
                          className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-purple-400 hover:text-purple-300 border border-purple-800/40 text-xs font-mono font-bold rounded-lg whitespace-nowrap transition-all"
                          title="Generate a random cryptographic string"
                        >
                          Generate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveSingle(s.key)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        {isKeySaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
