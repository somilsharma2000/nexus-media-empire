"use client";

import { useState } from "react";
import { Mail, CheckCircle, ArrowRight, Shield } from "lucide-react";

interface NewsletterFormProps {
  niche?: string;
  variant?: "inline" | "sidebar";
}

export default function NewsletterForm({ niche = "general", variant = "inline" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, niche }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg("You're in! Check your inbox for the latest intelligence briefs.");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "Subscription failed.");
      }
    } catch {
      setStatus("error");
      setMsg("Connection error. Please try again.");
    }
  };

  if (variant === "sidebar") {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 to-black border border-blue-900/40 space-y-3 text-left">
        <div className="flex items-center gap-2 text-blue-400">
          <Mail className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Executive Brief</span>
        </div>
        <h4 className="font-bold text-white text-sm">Get High-Yield Market Intel Delivered</h4>
        <p className="text-xs text-gray-400">Join 12,000+ founders and analysts receiving our daily briefings.</p>

        {status === "success" ? (
          <div className="p-3 bg-green-950/80 border border-green-800 text-green-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
            {msg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              required
              className="w-full bg-black/80 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              {status === "loading" ? "Subscribing..." : "Join Free Briefing"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="my-10 p-8 rounded-3xl bg-gradient-to-r from-gray-950 via-blue-950/30 to-gray-950 border border-blue-900/40 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
      <div className="inline-flex p-3 rounded-2xl bg-blue-900/20 text-blue-400 border border-blue-800/50">
        <Mail className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-white">Never Miss an Alpha Signal</h3>
      <p className="text-xs text-gray-400 max-w-md mx-auto">
        Join over 12,000 investors and tech builders. We break down the exact strategies, models, and empirical data shaping 2026.
      </p>

      {status === "success" ? (
        <div className="p-4 bg-green-950/80 border border-green-800 text-green-300 text-xs rounded-xl flex items-center justify-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {msg}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 shrink-0"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2">
        <Shield className="w-3 h-3 text-gray-400" /> No spam. Unsubscribe anytime in 1-click.
      </div>
    </div>
  );
}
