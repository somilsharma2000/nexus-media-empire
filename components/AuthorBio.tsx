import { CheckCircle2, ShieldCheck, Award } from "lucide-react";

interface AuthorBioProps {
  niche: string;
}

export default function AuthorBio({ niche }: AuthorBioProps) {
  const authorProfiles: Record<string, { name: string; role: string; bio: string; avatar: string }> = {
    news: {
      name: "Marcus Thorne",
      role: "Lead Machine Learning & Tech Analyst",
      bio: "Former systems architect with 12+ years evaluating large-scale autonomous agent frameworks, distributed neural compute, and enterprise SaaS models.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    },
    crypto: {
      name: "Elena Rostova",
      role: "Quantitative Blockchain Strategist",
      bio: "Specializing in decentralized consensus protocols, on-chain liquidity dynamics, and institutional ETF custody compliance.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    },
    finance: {
      name: "David Sterling, CFA",
      role: "Senior Macro & Capital Markets Editor",
      bio: "Ex-portfolio strategist with expertise in fixed income securities, multi-asset diversification, and quantitative valuation modeling.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    },
  };

  const author = authorProfiles[niche] || authorProfiles.news;

  return (
    <div className="my-10 p-6 rounded-3xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <img src={author.avatar} alt={author.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-800" />
        <div className="absolute -bottom-2 -right-2 p-1 bg-blue-600 rounded-full text-white" title="Verified Expert">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-1.5 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <h4 className="font-bold text-white text-base">{author.name}</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-900">
            {author.role}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xl">{author.bio}</p>
        <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-[11px] text-gray-500 font-medium">
          <span className="flex items-center gap-1 text-green-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Fact-Checked by Editorial Board
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Award className="w-3.5 h-3.5" /> E-E-A-T Verified
          </span>
        </div>
      </div>
    </div>
  );
}
