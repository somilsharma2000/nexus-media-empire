import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, FileCheck, DollarSign, Bot, Clock, Scale } from "lucide-react";

export const metadata = {
  title: "Enterprise Advertising Master Agreement & IO Terms | Nexus Media Empire",
  description: "Standard terms for direct advertising insertion orders, IAB 3.0 measurement criteria, payment schedules, and bot-traffic makegood guarantees.",
};

export default function AdvertisingTermsPage() {
  return (
    <div className="min-h-screen bg-[#03060a] text-gray-200 font-sans selection:bg-blue-500/30 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          href="/advertise"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Advertising Portal
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-gray-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5" /> Commercial Advertising Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Advertising Master Services Agreement
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            Governing all Digital Insertion Orders (IO), Brand Takeovers, and Direct Sponsorships across Nexus Media Corporation.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> 1. Insertion Order (IO) Execution &amp; Invoicing
            </h2>
            <p>
              All direct advertising campaigns require a formalized digital or signed Insertion Order (IO) generated through our automated billing infrastructure. Invoices are issued in United States Dollars (USD) or equivalent USD-pegged stablecoins (USDC/USDT).
            </p>
            <p>
              Standard commercial payment terms:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 font-mono text-xs">
              <li><strong className="text-white">Spotlight &amp; Growth Tiers ($500 - $5,000):</strong> 100% upfront payment prior to campaign launch.</li>
              <li><strong className="text-white">Enterprise &amp; Dominance Tiers ($10,000+):</strong> 50% prepayment upon IO signing, 50% Net-30 balance.</li>
            </ul>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" /> 2. Viewability Standards &amp; Bot-Traffic Makegood Guarantee
            </h2>
            <p>
              Nexus Media Corporation strictly adheres to <strong className="text-white">IAB/MRC Standard Measurement Protocols</strong> (minimum 50% of ad unit pixels visible for at least 1.0 continuous second for display, 2.0 seconds for video).
            </p>
            <p>
              <strong className="text-emerald-400 font-mono">100% Anti-Fraud Guarantee:</strong> All impressions and clicks are filtered in real-time by our autonomous edge verification firewall. In the event of confirmed automated scraper/bot anomalies exceeding 1.5% of total delivered inventory, Nexus provides a 100% impression makegood extension at no charge.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> 3. Creative Standards &amp; Brand Safety
            </h2>
            <p>
              All sponsor creatives must adhere to strict corporate brand guidelines. Nexus Media Corporation reserves the right to reject, pause, or request revisions for any creative that involves malicious links, deceptive financial guarantees, unlicensed securities promotions, or adult content.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" /> 4. Cancellation &amp; Force Majeure
            </h2>
            <p>
              Advertisers may terminate a recurring monthly sponsorship with 14 business days prior written notice. Pre-booked exclusive niche takeovers are non-refundable within 72 hours of scheduled live broadcast due to inventory reservation lockouts.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-wrap justify-between items-center text-xs font-mono text-gray-500 gap-4">
          <div>&copy; 2026 Nexus Media Corporation. All enterprise rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Master Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/disclosures" className="hover:text-gray-300 transition-colors">FTC Disclosures</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
