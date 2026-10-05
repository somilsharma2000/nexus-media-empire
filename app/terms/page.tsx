import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, FileText, Scale, Lock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Nexus Media Empire",
  description: "Enterprise Terms of Service, user agreements, intellectual property rights, and disclaimer of liability for Nexus Media Corporation.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#03060a] text-gray-200 font-sans selection:bg-blue-500/30 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Network
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-gray-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Corporate Governance
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Master Terms of Service
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            Effective Date: October 2026 &bull; Governing Entity: Nexus Media Corporation &bull; Version 4.2
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> 1. Acceptance of Master Agreement
            </h2>
            <p>
              By accessing, browsing, interacting with, or subscribing to any media network owned and operated by Nexus Media Corporation (including <strong className="text-white">The Trend Matrix</strong>, <strong className="text-white">Crypto Daily</strong>, and <strong className="text-white">Wall St Insider</strong>), you formally agree to be bound by these Master Terms of Service, all applicable international laws, and our Data Privacy Policies.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" /> 2. Disclaimer of Financial, Legal & Investment Advice
            </h2>
            <p className="text-gray-300">
              <strong className="text-amber-300 uppercase tracking-wide font-mono text-xs">Strict Financial Disclaimer:</strong> All content, telemetry tickers, quantitative analyses, valuation models, and macroeconomic commentary published across the Nexus Network are distributed exclusively for educational, journalistic, and informational purposes. 
            </p>
            <p>
              Nexus Media Corporation is not a registered investment advisor, broker-dealer, commodity trading advisor, or financial planning firm. No communication on this platform constitutes a recommendation, solicitation, or endorsement to purchase or liquidate any security, digital asset, cryptocurrency, derivative, or financial instrument. Readers must conduct independent due diligence with certified financial fiduciaries prior to executing capital transactions.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> 3. Proprietary Intellectual Property & AI Licensing
            </h2>
            <p>
              All proprietary algorithms, behavioral telemetry models, quantitative indices, layout designs, and original research published across the network are the exclusive intellectual property of Nexus Media Corporation protected under international copyright, trademark, and trade secret treaties.
            </p>
            <p>
              Automated scraping, programmatic extraction, or training of commercial LLMs on raw Nexus Network feeds without explicit enterprise API licensing agreements is strictly prohibited and subject to injunctive relief.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> 4. Digital Assets, Subscriptions & Billing
            </h2>
            <p>
              All digital product purchases (such as Valuation Spreadsheets, Algorithmic Frameworks, and Executive Dossiers) represent irrevocable digital licenses delivered instantly upon payment authorization. Due to the instantaneous delivery of proprietary formulas and code, all digital asset sales are final once download tokens have been generated.
            </p>
            <p>
              Enterprise advertising sponsorships and insertion orders are governed by our <Link href="/advertise/terms" className="text-blue-400 underline hover:text-blue-300">Enterprise Advertising Master Services Agreement</Link>.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" /> 5. Limitation of Liability & Arbitration
            </h2>
            <p>
              In no event shall Nexus Media Corporation, its directors, officers, engineers, or contributors be held liable for any direct, indirect, incidental, punitive, or consequential damages resulting from market volatility, server downtime, algorithmic latency, or reliance on network reporting. Any dispute arising from these terms shall be settled via binding commercial arbitration under UNCITRAL rules.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-wrap justify-between items-center text-xs font-mono text-gray-500 gap-4">
          <div>&copy; 2026 Nexus Media Corporation. All enterprise rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/disclosures" className="hover:text-gray-300 transition-colors">FTC Disclosures</Link>
            <Link href="/advertise/terms" className="hover:text-gray-300 transition-colors">Advertising Terms</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
