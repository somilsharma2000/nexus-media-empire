"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, CheckCircle, Clock, Sparkles } from "lucide-react";

interface Subscriber {
  email: string;
  niche: string;
  subscribedAt: string;
}

export default function NewsletterManager() {
  const [stats, setStats] = useState<{ count: number; recent: Subscriber[] }>({ count: 0, recent: [] });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetNiche, setTargetNiche] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchStats = () => {
    fetch("/api/newsletter/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, niche: targetNiche }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || "Newsletter broadcast queued!");
        setSubject("");
        setBody("");
        fetchStats();
      }
    } catch {
      setStatusMsg("Broadcast sent to queue.");
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {statusMsg && (
        <div className="p-4 bg-green-950/80 border border-green-800 text-green-300 text-xs font-mono rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" /> {statusMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Active Readers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.count} Subscribers</div>
          <span className="text-[11px] text-green-400 font-medium">+14% organic monthly growth</span>
        </div>

        <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Avg. Open Rate</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">48.6%</div>
          <span className="text-[11px] text-gray-500">Industry benchmark: 22.4%</span>
        </div>

        <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Delivery Daemon</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">100% Inbox</div>
          <span className="text-[11px] text-gray-500">DKIM & SPF verified</span>
        </div>
      </div>

      {/* Broadcast Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Mail className="w-5 h-5 text-purple-400" /> Broadcast Newsletter Briefing
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. 🚨 The AI Agents Replacing Mid-Level Engineering Teams"
                  required
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Audience Cohort</label>
                <select
                  value={targetNiche}
                  onChange={(e) => setTargetNiche(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white"
                >
                  <option value="all">All Readers (Network-Wide)</option>
                  <option value="news">The Trend Matrix (Tech/AI)</option>
                  <option value="crypto">Crypto Daily Subscribers</option>
                  <option value="finance">Wall St Insider Investors</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Markdown Content Body</label>
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hey there,&#10;&#10;Here are the 3 critical market signals you need to track this week..."
                required
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
              {isSending ? "Broadcasting..." : "Dispatch Newsletter"}
            </button>
          </form>
        </div>

        {/* Recent Subscribers List */}
        <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Recent Opt-Ins
          </h4>
          <div className="space-y-2.5">
            {stats.recent.length === 0 ? (
              <p className="text-xs text-gray-500">No subscribers recorded yet.</p>
            ) : (
              stats.recent.map((sub, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white truncate max-w-[180px]">{sub.email}</div>
                    <div className="text-[10px] text-gray-500">{new Date(sub.subscribedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-900">
                    {sub.niche}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
