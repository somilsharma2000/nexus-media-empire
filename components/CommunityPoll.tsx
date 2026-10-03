"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, Sparkles } from "lucide-react";

export default function CommunityPoll() {
  const [voted, setVoted] = useState<string | null>(null);
  const [counts, setCounts] = useState({ up: 184, down: 6 });

  const handleVote = (type: "up" | "down") => {
    if (voted) return;
    setVoted(type);
    if (type === "up") setCounts((c) => ({ ...c, up: c.up + 1 }));
    if (type === "down") setCounts((c) => ({ ...c, down: c.down + 1 }));
  };

  const total = counts.up + counts.down;
  const upPercent = Math.round((counts.up / total) * 100);

  return (
    <div className="my-10 p-6 rounded-3xl bg-gray-950 border border-gray-800 text-center space-y-4">
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <Sparkles className="w-4 h-4 text-yellow-400" /> Reader Sentiment & Peer Review
      </div>
      <h4 className="text-base font-bold text-white">Was this strategic analysis actionable?</h4>

      {voted ? (
        <div className="space-y-3 max-w-sm mx-auto">
          <div className="p-3 bg-green-950/60 border border-green-800 text-green-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" /> Thank you for your feedback!
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{upPercent}% found this guide helpful</span>
            <span className="font-mono">{total} verified votes</span>
          </div>
          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
            <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${upPercent}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleVote("up")}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-green-800 text-gray-200 hover:text-green-400 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ThumbsUp className="w-4 h-4" /> Highly Helpful ({counts.up})
          </button>
          <button
            onClick={() => handleVote("down")}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-800 text-gray-400 hover:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ThumbsDown className="w-4 h-4" /> Needs Detail ({counts.down})
          </button>
        </div>
      )}
    </div>
  );
}
