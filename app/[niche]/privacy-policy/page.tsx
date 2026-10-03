import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage({ params }: { params: { niche: string } }) {
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
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Compliance & Privacy
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-2">Privacy & Cookie Policy</h1>
          <p className="text-xs text-gray-500 mt-2 font-mono">Last Updated: October 2026 • Compliant with GDPR, CCPA, and Google AdSense</p>
        </div>

        <div className="space-y-6 text-xs text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              {publicationName} collects standard log telemetry, including IP addresses, browser types, referring URLs, and interaction timestamps. We collect email addresses only when voluntarily submitted via our newsletter or inquiry forms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Google AdSense & Third-Party Advertising Cookies</h2>
            <p>
              Third-party vendors, including Google, use cookies to serve ads based on prior visits to our website. Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visits to our sites and/or other sites on the Internet.
            </p>
            <p>
              Users may opt out of personalized advertising by visiting{" "}
              <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-blue-400 underline">
                aboutads.info
              </a>{" "}
              or managing their preferences through Google Ad Settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Affiliate Links & Financial Disclosures</h2>
            <p>
              Certain outbound links on this website are affiliate links. If you make a purchase or complete a signup through these links, {publicationName} may receive a commission at no additional cost to you. All sponsored or affiliate content is explicitly identified.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Data Protection & Your Rights</h2>
            <p>
              You have the right to request access to, rectification of, or erasure of your personal data. To exercise these rights or request complete data deletion, please contact: privacy@nexusmedianetwork.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
