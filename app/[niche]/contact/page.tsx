import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export default function ContactPage({ params }: { params: { niche: string } }) {
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
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Get In Touch</span>
          <h1 className="text-4xl font-extrabold text-white mt-2">Contact {publicationName}</h1>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed">
            Have a news tip, correction, partnership inquiry, or press release? Reach our dedicated editorial and advertising desks below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-white text-sm">Editorial Desk</h4>
            <p className="text-xs text-gray-400 font-mono">editorial@thetrendmatrix.com</p>
          </div>
          <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-white text-sm">Press & Syndication</h4>
            <p className="text-xs text-gray-400 font-mono">press@nexusmedianetwork.com</p>
          </div>
          <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <h4 className="font-bold text-white text-sm">HQ Office</h4>
            <p className="text-xs text-gray-400">Wilmington, DE 19801, USA</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Send an Editorial Inquiry</h3>
          <form className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Your Email</label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Subject</label>
              <input
                type="text"
                placeholder="News Tip / Partnership Proposal"
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Message</label>
              <textarea
                rows={5}
                placeholder="Please describe your inquiry with relevant source links or documentation..."
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30"
            >
              Submit Dispatch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
