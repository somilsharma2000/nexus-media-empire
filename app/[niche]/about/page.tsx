import Link from "next/link";
import { ArrowLeft, Shield, Award, Users, CheckCircle } from "lucide-react";

export default function AboutPage({ params }: { params: { niche: string } }) {
  const nicheNames: Record<string, string> = {
    news: "The Trend Matrix",
    crypto: "Crypto Daily",
    finance: "Wall St Insider",
  };
  const publicationName = nicheNames[params.niche] || "Nexus Media";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link
          href={`/${params.niche}`}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {publicationName}
        </Link>

        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Editorial Mission</span>
          <h1 className="text-4xl font-extrabold text-white mt-2">About {publicationName}</h1>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed">
            {publicationName} is an authoritative digital publication providing empirical research, institutional market insights, and verifiable frameworks for forward-thinking professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-gray-800 py-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="w-4 h-4 text-yellow-400" /> Rigorous Standards
            </div>
            <p className="text-xs text-gray-400">All analysis undergoes a multi-layer verification and editorial review.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Users className="w-4 h-4 text-blue-400" /> 50,000+ Readers
            </div>
            <p className="text-xs text-gray-400">Trusted by founders, quantitative analysts, and independent investors.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-green-400" /> Zero Compromise
            </div>
            <p className="text-xs text-gray-400">Clear separation between sponsored partner content and editorial research.</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-xl font-bold text-white">Editorial Guidelines & Fact-Checking</h2>
          <p>
            Our journalists and quantitative models analyze primary datasets, SEC filings, blockchain ledgers, and academic publications. We do not publish unverified market rumors or sponsored endorsements without explicit FTC disclosures.
          </p>
          <p>
            Corrections are immediately appended to the header of articles with timestamped change logs to maintain full transparency with our readership.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">Executive Leadership & Contact</h2>
          <p>
            {publicationName} is operated by Nexus Autonomous Media Network LLC. For press inquiries, syndication licenses, or editorial feedback, contact our managing desk at:
          </p>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 font-mono text-xs text-gray-300">
            Nexus Media Editorial Desk<br />
            Email: editorial@{params.niche === "news" ? "thetrendmatrix.com" : params.niche === "crypto" ? "cryptodaily.io" : "wallstinsider.com"}<br />
            Business Inquiries: contact@nexusmedianetwork.com<br />
            Address: 100 Innovation Way, Suite 400, Wilmington, DE 19801
          </div>
        </div>
      </div>
    </div>
  );
}
