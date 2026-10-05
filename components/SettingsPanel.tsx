"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, CheckCircle, AlertCircle, Copy, RefreshCw, Key, Bot, Database, Globe, Zap, Shield } from "lucide-react";

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
    title: "AI Engine",
    icon: <Zap className="w-5 h-5" />,
    color: "yellow",
    settings: [
      {
        key: "NVIDIA_API_KEY",
        label: "NVIDIA AI API Key (Preferred)",
        description: "Zero rate limit high-throughput generation via NVIDIA NIM. Get at build.nvidia.com",
        placeholder: "nvapi-...",
        isSecret: true,
        required: false,
        helpUrl: "https://build.nvidia.com",
      },
      {
        key: "NVIDIA_MODEL",
        label: "NVIDIA Model Name",
        description: "Model to use for writing (e.g. meta/llama-3.3-70b-instruct or nvidia/llama-3.1-nemotron-70b-instruct).",
        placeholder: "meta/llama-3.3-70b-instruct",
        required: false,
      },
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API Key (Fallback)",
        description: "Powers article generation and QA review. Get yours at platform.openai.com/api-keys",
        placeholder: "sk-proj-...",
        isSecret: true,
        required: false,
        helpUrl: "https://platform.openai.com/api-keys",
      },
      {
        key: "MAX_MONTHLY_AI_BUDGET",
        label: "Monthly AI Budget (USD)",
        description: "Hard cap on OpenAI spend per month. Pipeline pauses when reached.",
        placeholder: "20",
        required: false,
      },
    ],
  },
  {
    title: "Database",
    icon: <Database className="w-5 h-5" />,
    color: "blue",
    settings: [
      {
        key: "DATABASE_URL",
        label: "Database URL",
        description: "Supabase PostgreSQL connection string. Get a free DB at supabase.com",
        placeholder: "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres",
        isSecret: true,
        required: true,
        helpUrl: "https://supabase.com",
      },
    ],
  },
  {
    title: "Admin Auth",
    icon: <Shield className="w-5 h-5" />,
    color: "green",
    settings: [
      {
        key: "AUTH_SECRET",
        label: "Auth Secret",
        description: "Random string used to sign sessions. Generate one below.",
        placeholder: "a-random-32-character-string",
        isSecret: true,
        required: true,
        generateable: true,
      },
      {
        key: "ADMIN_EMAIL",
        label: "Admin Email",
        description: "Your login email for the Command Center.",
        placeholder: "admin@yourdomain.com",
        required: true,
      },
      {
        key: "ADMIN_PASSWORD_HASH",
        label: "Admin Password Hash",
        description: "bcrypt hash of your password. Type a password below and click Generate Hash.",
        placeholder: "$2a$10$...",
        isSecret: true,
        required: true,
        generateable: true,
      },
    ],
  },
  {
    title: "Automation",
    icon: <RefreshCw className="w-5 h-5" />,
    color: "purple",
    settings: [
      {
        key: "CRON_SECRET",
        label: "Cron Secret",
        description: "Secures all automated pipeline endpoints. Use any random string.",
        placeholder: "nexus-cron-secret-2026",
        isSecret: true,
        required: true,
        generateable: true,
      },
      {
        key: "ALERT_WEBHOOK_URL",
        label: "Alert Webhook URL",
        description: "Slack, Discord, or Make.com webhook for system alerts. Optional.",
        placeholder: "https://hooks.slack.com/...",
        required: false,
      },
    ],
  },
  {
    title: "Telegram Bot",
    icon: <Bot className="w-5 h-5" />,
    color: "cyan",
    settings: [
      {
        key: "TELEGRAM_BOT_TOKEN",
        label: "Telegram Bot Token",
        description: "From @BotFather. See TELEGRAM_SETUP.md for full guide.",
        placeholder: "1234567890:AAF...",
        isSecret: true,
        required: false,
        helpUrl: "https://t.me/BotFather",
      },
      {
        key: "TELEGRAM_ADMIN_USER_ID",
        label: "Your Telegram User ID",
        description: "Get from @userinfobot on Telegram. Locks the bot to only you.",
        placeholder: "123456789",
        required: false,
        helpUrl: "https://t.me/userinfobot",
      },
    ],
  },
  {
    title: "Google & AdSense",
    icon: <Globe className="w-5 h-5" />,
    color: "red",
    settings: [
      {
        key: "NEXT_PUBLIC_ADSENSE_CLIENT",
        label: "AdSense Publisher ID",
        description: "Your pub-XXXXXXXXXXXXXXXX ID from AdSense. Required for ad revenue.",
        placeholder: "pub-0000000000000000",
        required: false,
        helpUrl: "https://adsense.google.com",
      },
      {
        key: "NEXT_PUBLIC_SITE_URL",
        label: "Live Site URL",
        description: "Your Vercel deployment URL. Used for SEO pings and Telegram links.",
        placeholder: "https://nexus-media-empire.vercel.app",
        required: false,
      },
      {
        key: "GOOGLE_INDEXING_API_KEY",
        label: "Google Indexing API Key",
        description: "Optional. Pings Google to index new articles immediately.",
        placeholder: "AIza...",
        isSecret: true,
        required: false,
        helpUrl: "https://console.cloud.google.com",
      },
    ],
  },
];

function generateSecret(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const COLOR_MAP: Record<string, string> = {
  yellow: "text-yellow-400 bg-yellow-900/20 border-yellow-800/50",
  blue: "text-blue-400 bg-blue-900/20 border-blue-800/50",
  green: "text-green-400 bg-green-900/20 border-green-800/50",
  purple: "text-purple-400 bg-purple-900/20 border-purple-800/50",
  cyan: "text-cyan-400 bg-cyan-900/20 border-cyan-800/50",
  red: "text-red-400 bg-red-900/20 border-red-800/50",
};

export default function SettingsPanel() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [passwordInput, setPasswordInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("nexus_settings");
    if (stored) {
      try { setValues(JSON.parse(stored)); } catch {}
    }
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (key: string) => {
    const current = JSON.parse(localStorage.getItem("nexus_settings") || "{}");
    current[key] = values[key] || "";
    localStorage.setItem("nexus_settings", JSON.stringify(current));
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
    showToast(`${key} saved locally`);
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        localStorage.setItem("nexus_settings", JSON.stringify(values));
        showToast("All settings saved ✓");
      } else {
        showToast("Save failed — check server", "error");
      }
    } catch {
      // Fallback: save to localStorage only
      localStorage.setItem("nexus_settings", JSON.stringify(values));
      showToast("Saved to browser (deploy to persist on server)");
    }
  };

  const handleGenerate = (key: string) => {
    const secret = generateSecret(key === "AUTH_SECRET" ? 32 : 24);
    setValues((prev) => ({ ...prev, [key]: secret }));
  };

  const handleHashPassword = async () => {
    if (!passwordInput) return;
    setIsHashing(true);
    try {
      const res = await fetch("/api/settings/hash-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      setHashResult(data.hash);
      setValues((prev) => ({ ...prev, ADMIN_PASSWORD_HASH: data.hash }));
      showToast("Hash generated — saved to field above");
    } catch {
      showToast("Failed to hash password", "error");
    }
    setIsHashing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-medium text-sm transition-all ${toast.type === "success" ? "bg-green-900 border border-green-700 text-green-200" : "bg-red-900 border border-red-700 text-red-200"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header banner */}
      <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-5 flex items-start gap-4">
        <Key className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-blue-200 font-semibold text-sm">Settings are saved to your browser locally.</p>
          <p className="text-blue-400 text-xs mt-1">To make them permanent on Vercel: copy each value → go to <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-blue-300">vercel.com/dashboard</a> → Project Settings → Environment Variables → paste.</p>
        </div>
      </div>

      {/* Setting Groups */}
      {SETTING_GROUPS.map((group) => (
        <div key={group.title} className={`border rounded-xl overflow-hidden ${COLOR_MAP[group.color].split(" ").slice(2).join(" ")}`}>
          <div className={`px-6 py-4 flex items-center gap-3 ${COLOR_MAP[group.color].split(" ").slice(0, 2).join(" ")} border-b ${COLOR_MAP[group.color].split(" ").slice(2).join(" ")}`}>
            {group.icon}
            <h3 className="font-bold text-base">{group.title}</h3>
          </div>
          <div className="bg-gray-950/60 divide-y divide-gray-800/50">
            {group.settings.map((setting) => (
              <div key={setting.key} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-white text-sm">{setting.label}</label>
                      {setting.required && <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded">Required</span>}
                      {!setting.required && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Optional</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{setting.description}</p>
                    {setting.helpUrl && (
                      <a href={setting.helpUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 inline-block">
                        Get it here →
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={setting.isSecret && !revealed[setting.key] ? "password" : "text"}
                      value={values[setting.key] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                      placeholder={setting.placeholder}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 font-mono focus:border-blue-500 focus:outline-none pr-10"
                    />
                    {setting.isSecret && (
                      <button
                        onClick={() => setRevealed((prev) => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {revealed[setting.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {setting.generateable && (
                    <button
                      onClick={() => handleGenerate(setting.key)}
                      className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-gray-700 whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generate
                    </button>
                  )}

                  {values[setting.key] && (
                    <button
                      onClick={() => handleCopy(values[setting.key])}
                      className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs border border-gray-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSave(setting.key)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${saved[setting.key] ? "bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                  >
                    {saved[setting.key] ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save</>}
                  </button>
                </div>

                {/* Password hasher UI — only for ADMIN_PASSWORD_HASH */}
                {setting.key === "ADMIN_PASSWORD_HASH" && (
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-400 mb-3 font-medium">🔐 Password Hasher — type your desired password and click Generate Hash:</p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Type your admin password..."
                        className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 focus:border-green-500 focus:outline-none"
                      />
                      <button
                        onClick={handleHashPassword}
                        disabled={!passwordInput || isHashing}
                        className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        {isHashing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                        Generate Hash
                      </button>
                    </div>
                    {hashResult && (
                      <div className="mt-3 p-3 bg-black rounded border border-green-900/50">
                        <p className="text-xs text-green-400 font-mono break-all">{hashResult}</p>
                        <p className="text-xs text-gray-500 mt-1">↑ Auto-filled in the field above. Copy it to Vercel env vars.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save All button */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 self-center">Changes are saved to your browser. Copy values to Vercel for production.</p>
        <button
          onClick={handleSaveAll}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </div>
    </div>
  );
}
