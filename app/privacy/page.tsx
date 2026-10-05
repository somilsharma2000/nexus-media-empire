import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Globe, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & GDPR Compliance | Nexus Media Empire",
  description: "Enterprise privacy policy, GDPR compliance, CCPA opt-out, telemetry handling, and data encryption practices of Nexus Media Corporation.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Data Sovereignty
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Enterprise Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            Compliant with EU GDPR (2016/679), California Consumer Privacy Act (CCPA/CPRA), and ePrivacy Directive.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" /> 1. Data Collection & Behavioral Telemetry
            </h2>
            <p>
              Nexus Media Corporation respects reader privacy. We collect minimal telemetry data strictly required to deliver high-performance editorial content, detect bot abuse, and optimize contextual display advertising:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 font-mono text-xs">
              <li>Session telemetry (dwell time, scroll velocity, reading completion rate) stored locally in browser storage</li>
              <li>Anonymized IP telemetry for geographic ad routing (Tier 1 vs Global filtering)</li>
              <li>Email addresses submitted voluntarily for newsletter digests (processed via Beehiiv API with zero-sharing guarantees)</li>
              <li>Sponsorship inquiry contact metadata for enterprise billing</li>
            </ul>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> 2. Cookie Management & Zero-Tracker Philosophy
            </h2>
            <p>
              We do not sell personal data to third-party data brokers. Cookies utilized across the Nexus Network are categorized into:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-[#05080f] border border-gray-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-white font-mono">Essential Infrastructure</span>
                <p className="text-xs text-gray-400">Strictly required for session state, reading progress, and DDoS mitigation.</p>
              </div>
              <div className="p-4 bg-[#05080f] border border-gray-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-white font-mono">Consented Ad Attributes</span>
                <p className="text-xs text-gray-400">Frequency capping to ensure readers are never spammed with repetitive sponsor units.</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> 3. Your Rights Under GDPR & CCPA
            </h2>
            <p>
              Regardless of your geographic location, you retain full sovereignty over your digital footprint across our platform:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">Right to Access & Portability:</strong> Request an export of any data linked to your email address.</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">Right to Erasure (Be Forgotten):</strong> Request permanent deletion of newsletter subscriptions or billing history.</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">Right to Opt-Out:</strong> Toggle cookie preferences at any time via our Cookie Consent banner.</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> 4. Data Protection Officer (DPO) Contact
            </h2>
            <p>
              For legal inquiries, GDPR subject access requests (SAR), or privacy questions, contact our corporate legal department:
            </p>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-xs text-gray-300 space-y-1">
              <div>Legal Entity: Nexus Media Corporation (Data Protection Division)</div>
              <div>Email: <span className="text-blue-400">legal@nexuscorp.media</span></div>
              <div>Response SLA: Within 48 business hours</div>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-wrap justify-between items-center text-xs font-mono text-gray-500 gap-4">
          <div>&copy; 2026 Nexus Media Corporation. All enterprise rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/disclosures" className="hover:text-gray-300 transition-colors">FTC Disclosures</Link>
            <Link href="/advertise/terms" className="hover:text-gray-300 transition-colors">Advertising Terms</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
