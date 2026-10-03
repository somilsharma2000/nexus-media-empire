import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage({ params }: { params: { niche: string } }) {
  const nicheNames: Record<string, string> = {
    news: "The Trend Matrix",
    crypto: "Crypto Daily",
    finance: "Wall St Insider",
  };
  const publicationName = nicheNames[params.niche] || "Nexus Media";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href={`/${params.niche}`}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {publicationName}
        </Link>

        <div>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Legal Framework
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-2">Terms of Service</h1>
          <p className="text-xs text-gray-500 mt-2 font-mono">Last Updated: October 2026</p>
        </div>

        <div className="space-y-6 text-xs text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Informational & Educational Purposes Only</h2>
            <p>
              The content published on {publicationName} is provided solely for informational and educational purposes. None of the articles, analysis, or market commentary constitute legal, financial, tax, or investment advice.
            </p>
            <p>
              Always consult with a licensed financial advisor before making significant financial commitments or executing trading decisions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Intellectual Property & Syndication</h2>
            <p>
              All original content, proprietary benchmarks, and editorial frameworks are the intellectual property of Nexus Media Network. Syndication is permitted only with clear attribution and a do-follow canonical link pointing back to the original article URL.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Limitation of Liability</h2>
            <p>
              In no event shall {publicationName}, its authors, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the materials provided on this platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
