"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Download, CheckCircle2, ArrowRight } from "lucide-react";

interface ExitIntentModalProps {
  niche: string;
}

export default function ExitIntentModal({ niche }: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed in session
    const hasDismissed = sessionStorage.getItem("nexus_exit_dismissed");
    if (hasDismissed) return;

    let triggerCount = 0;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && triggerCount === 0 && !dismissed) {
        triggerCount++;
        setIsOpen(true);
      }
    };

    // Also trigger after 45s of active reading
    const timer = setTimeout(() => {
      if (!dismissed && !sessionStorage.getItem("nexus_exit_dismissed")) {
        setIsOpen(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed]);

  const handleClose = () => {
    setIsOpen(false);
    setDismissed(true);
    sessionStorage.setItem("nexus_exit_dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, niche }),
    }).catch(() => {});

    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  if (!isOpen) return null;

  const leadMagnets: Record<string, { title: string; subtitle: string; highlights: string[] }> = {
    news: {
      title: "The 2026 Solo Founder AI Automation Playbook",
      subtitle: "Free 18-page PDF cheat sheet covering no-code LLM pipelines and prompt templates.",
      highlights: ["Top 15 Agent Architecture Blueprints", "Ready-to-use Prompt Injection Defense", "No-code Supabase + Next.js Stack Guide"]
    },
    crypto: {
      title: "The Web3 & DeFi Risk Mitigation Checklist",
      subtitle: "Protect your portfolio: Contract audit checklists, cold storage setup, and tax guides.",
      highlights: ["Hardware Wallet Emergency Recovery Sheet", "Smart Contract Audit Red Flags", "2026 Tax Loss Harvesting Guide"]
    },
    finance: {
      title: "The All-Weather Wealth Compounding Matrix",
      subtitle: "Calculators and step-by-step asset allocation models for 12%+ annualized wealth generation.",
      highlights: ["Interactive SIP & Retirement Amortizer", "Top 5 Low-Expense Index Fund Model", "Emergency Fund & SGB Calculator"]
    }
  };

  const content = leadMagnets[niche] || leadMagnets.news;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 to-[#080808] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/60 hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Inbox!</h3>
            <p className="text-xs text-gray-400">
              Your free playbook and download links have been sent. Welcome to the inner circle!
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXCLUSIVE COMPLIMENTARY ASSET</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-2">
              {content.title}
            </h3>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              {content.subtitle}
            </p>

            <div className="space-y-2 mb-6 bg-gray-950/60 p-3.5 rounded-2xl border border-gray-800">
              {content.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to receive instant access..."
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Instant Free Download</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <p className="text-[10px] text-gray-500 text-center mt-3">
              Zero spam. 1-click unsubscribe anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
