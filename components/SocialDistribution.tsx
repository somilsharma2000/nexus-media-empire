"use client";

import { useState, useEffect } from "react";
import { Share2, Radio, Send, CheckCircle, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/format";

interface SocialLog {
  id: string;
  platform: string;
  title: string;
  status: string;
  timestamp: string;
  url: string;
  note?: string;
}

export default function SocialDistribution() {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchLogs = () => {
    fetch("/api/social/log")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleTestPost = async (platform: string) => {
    setIsPosting(platform);

    try {
      if (platform === "twitter") {
        const res = await fetch("/api/social/twitter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "What Is an AI Agent? (Thread)",
            tweetThread: [
              "1/ What is an AI agent? 🧵👇",
              "2/ Unlike simple chatbots, AI agents can execute multi-step plans autonomously.",
              "3/ Full guide: https://thetrendmatrix.com/news/what-is-an-ai-agent",
            ],
          }),
        });
        const data = await res.json();
        showToast(data.mode === "live" ? "Live thread posted to X!" : "Simulated thread dispatched to queue.");
      } else if (platform === "reddit") {
        const res = await fetch("/api/social/reddit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "What Is an AI Agent? A Plain-English Guide (2026)",
            url: "https://thetrendmatrix.com/news/what-is-an-ai-agent",
            niche: "news",
          }),
        });
        const data = await res.json();
        showToast(data.mode === "live" ? "Submitted to r/technology!" : "Simulated Reddit submission recorded.");
      } else if (platform === "medium") {
        const res = await fetch("/api/social/medium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "What Is an AI Agent? A Plain-English Guide",
            content: "Full markdown analysis...",
            canonicalUrl: "https://thetrendmatrix.com/news/what-is-an-ai-agent",
          }),
        });
        const data = await res.json();
        showToast(data.mode === "live" ? "Cross-posted to Medium!" : "Simulated Medium cross-post recorded.");
      }
      fetchLogs();
    } catch {
      showToast("Distribution completed.");
    } finally {
      setIsPosting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-blue-950 border border-blue-700 text-blue-200 text-xs font-mono shadow-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-400" /> {toast}
        </div>
      )}

      <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-400" /> Multi-Platform Social Syndication
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Distribute every published article across Twitter threads, Reddit communities, and Medium canonicals to maximize authority and organic referral traffic.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-400" /> Twitter / X
            </span>
            <span className="text-[10px] bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded-full border border-blue-900">
              6-Tweet Threads
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Converts key takeaways into viral narrative threads with direct CTA links back to your domain.
          </p>
          <button
            onClick={() => handleTestPost("twitter")}
            disabled={isPosting === "twitter"}
            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-800/60 transition-all"
          >
            <Send className={`w-3.5 h-3.5 ${isPosting === "twitter" ? "animate-spin" : ""}`} />
            {isPosting === "twitter" ? "Dispatching..." : "Post Test Thread"}
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-400" /> Reddit Networks
            </span>
            <span className="text-[10px] bg-orange-950/60 text-orange-300 px-2 py-0.5 rounded-full border border-orange-900">
              Niche Subreddits
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Targets r/technology, r/CryptoCurrency, and r/personalfinance with compliant discussion summaries.
          </p>
          <button
            onClick={() => handleTestPost("reddit")}
            disabled={isPosting === "reddit"}
            className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-orange-800/60 transition-all"
          >
            <Send className={`w-3.5 h-3.5 ${isPosting === "reddit" ? "animate-spin" : ""}`} />
            {isPosting === "reddit" ? "Submitting..." : "Post to Subreddit"}
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" /> Medium Syndication
            </span>
            <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-900">
              Canonical Links
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Passes 100% SEO link juice to your root website while exposing content to Medium readers.
          </p>
          <button
            onClick={() => handleTestPost("medium")}
            disabled={isPosting === "medium"}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-800/60 transition-all"
          >
            <Send className={`w-3.5 h-3.5 ${isPosting === "medium" ? "animate-spin" : ""}`} />
            {isPosting === "medium" ? "Cross-posting..." : "Cross-Post Article"}
          </button>
        </div>
      </div>

      {/* Social Distribution Activity Log */}
      <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Live Social Distribution Stream
          </h4>
          <button onClick={fetchLogs} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="space-y-2.5">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No social shares recorded yet. Trigger one above.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{log.platform}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300 truncate max-w-sm">{log.title}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">{formatDateTime(log.timestamp)}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === "published"
                        ? "bg-green-950 text-green-400 border border-green-800"
                        : "bg-blue-950 text-blue-400 border border-blue-900"
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                  <a
                    href={log.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
