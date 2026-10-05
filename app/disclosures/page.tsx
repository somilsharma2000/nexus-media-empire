import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, CheckCircle2, Award, DollarSign, Sparkles } from "lucide-react";

export const metadata = {
  title: "Editorial Independence & FTC Disclosures | Nexus Media Empire",
  description: "Mandatory FTC 16 CFR § 255.5 affiliate and sponsorship disclosures, editorial integrity guidelines, and advertising attribution charter.",
};

export default function DisclosuresPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Editorial Integrity Charter
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            FTC &amp; Affiliate Disclosures
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            Full compliance with U.S. Federal Trade Commission (FTC) Guides Concerning the Use of Endorsements and Testimonials in Advertising (16 CFR § 255.5).
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> 1. Affiliate Link Transparency &amp; Monetization
            </h2>
            <p>
              In accordance with FTC regulations, please note that certain outbound links published on Nexus Media Network publications (such as hardware wallet links, brokerage accounts, API tooling, and analytics software) are customized affiliate referral URLs routed through our secure <code className="text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded font-mono">/go/[slug]</code> attribution gateway.
            </p>
            <p>
              If a reader chooses to purchase a product or create an account via these links, Nexus Media Corporation may receive a referral commission at <strong className="text-white">zero additional cost to you</strong>. In many cases, our corporate partnerships unlock exclusive pricing discounts or extended trials for our readers.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> 2. Sponsored Content &amp; Brand Takeovers
            </h2>
            <p>
              Direct sponsor units (such as top header ribbons, dedicated enterprise spotlights, and newsletter broadcast features) are labeled explicitly with <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[11px] font-mono font-bold">SPONSORED</span> or <span className="px-2 py-0.5 bg-purple-950 text-purple-400 border border-purple-800 rounded text-[11px] font-mono font-bold">PROMOTED</span> tags.
            </p>
            <p>
              Sponsorship fees never dictate, influence, or alter our objective quantitative scoring models, investigative journalism, or negative reporting on underperforming software or protocols.
            </p>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> 3. Editorial Independence Firewall
            </h2>
            <p>
              Our editorial and automated trend-scouting pipelines operate behind a strict structural firewall completely separated from our advertising and monetization desks. Our journalists and AI verification models prioritize factual rigor, empirical citations, and reader utility above all commercial relationships.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-wrap justify-between items-center text-xs font-mono text-gray-500 gap-4">
          <div>&copy; 2026 Nexus Media Corporation. All enterprise rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/advertise/terms" className="hover:text-gray-300 transition-colors">Advertising Terms</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
