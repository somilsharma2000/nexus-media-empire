"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Download, Copy, Sparkles, CheckCircle, RefreshCw, Layers, Palette } from "lucide-react";

interface Article {
  id: string;
  title: string;
  niche: string;
  slug: string;
}

export default function PosterStudio() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("What Is an AI Agent? A Plain-English Guide");
  const [selectedNiche, setSelectedNiche] = useState("news");
  const [theme, setTheme] = useState<"matrix" | "crypto" | "finance" | "cyberpunk">("matrix");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "9:16">("16:9");
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data: Article[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectArticle = (id: string) => {
    const found = articles.find((a) => a.id === id);
    if (found) {
      setSelectedTitle(found.title);
      setSelectedNiche(found.niche);
      if (found.niche === "crypto") setTheme("crypto");
      else if (found.niche === "finance") setTheme("finance");
      else setTheme("matrix");
    }
  };

  const themeStyles = {
    matrix: {
      bg: "from-blue-950 via-black to-blue-950",
      accent: "text-blue-400",
      border: "border-blue-800/60",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      tagline: "THE TREND MATRIX • TECH INTELLIGENCE",
    },
    crypto: {
      bg: "from-amber-950 via-black to-orange-950",
      accent: "text-amber-400",
      border: "border-amber-800/60",
      badgeBg: "bg-amber-500",
      badgeText: "text-black",
      tagline: "CRYPTO DAILY • DECENTRALIZED ALPHA",
    },
    finance: {
      bg: "from-emerald-950 via-black to-green-950",
      accent: "text-emerald-400",
      border: "border-emerald-800/60",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      tagline: "WALL ST INSIDER • INSTITUTIONAL INSIGHTS",
    },
    cyberpunk: {
      bg: "from-purple-950 via-black to-pink-950",
      accent: "text-pink-400",
      border: "border-purple-800/60",
      badgeBg: "bg-pink-600",
      badgeText: "text-white",
      tagline: "NEXUS FUTURE MATRIX • VERIFIED 2026",
    },
  };

  const activeTheme = themeStyles[theme];

  const handleCopyLink = () => {
    const ogUrl = `${window.location.origin}/api/og?title=${encodeURIComponent(selectedTitle)}&niche=${selectedNiche}`;
    navigator.clipboard.writeText(ogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSVG = () => {
    const ogUrl = `/api/og?title=${encodeURIComponent(selectedTitle)}&niche=${selectedNiche}`;
    window.open(ogUrl, "_blank");
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 rounded-2xl border border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" /> Dynamic Promo Poster Studio
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Generate branded social promo posters, viral Twitter banners, and YouTube-style title cards with high-contrast typography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 transition-all"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Image URL Copied!" : "Copy Image Link"}
          </button>
          <button
            onClick={handleDownloadSVG}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-pink-600/30"
          >
            <Download className="w-3.5 h-3.5" /> Export High-Res SVG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="space-y-5 bg-gray-950 p-6 rounded-2xl border border-gray-800 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Pick Vault Article</label>
            <select
              onChange={(e) => handleSelectArticle(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">-- Choose from 35 Evergreen Guides --</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.niche.toUpperCase()}] {a.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Custom Headline / Title</label>
            <textarea
              rows={3}
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-2">Visual Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "matrix", label: "Matrix Tech", color: "border-blue-500 text-blue-400" },
                { id: "crypto", label: "Crypto Neon", color: "border-amber-500 text-amber-400" },
                { id: "finance", label: "Wall St Green", color: "border-emerald-500 text-emerald-400" },
                { id: "cyberpunk", label: "Cyberpunk Pink", color: "border-pink-500 text-pink-400" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    theme === t.id ? `${t.color} bg-gray-900` : "border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-2">Aspect Ratio Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "16:9", label: "16:9 Banner" },
                { id: "1:1", label: "1:1 Square" },
                { id: "9:16", label: "9:16 Story" },
              ].map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === ar.id ? "border-pink-500 text-white bg-pink-950/40" : "border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-black/60 border border-gray-900 rounded-3xl p-6 relative overflow-hidden">
          <div
            ref={posterRef}
            className={`w-full bg-gradient-to-br ${activeTheme.bg} border ${activeTheme.border} rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
              aspectRatio === "16:9"
                ? "aspect-video"
                : aspectRatio === "1:1"
                ? "aspect-square max-w-md"
                : "aspect-[9/16] max-w-sm"
            }`}
          >
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Top Bar Header */}
            <div className="flex items-center justify-between z-10">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${activeTheme.badgeBg} ${activeTheme.badgeText}`}>
                OFFICIAL REPORT
              </span>
              <span className="text-[11px] font-mono text-gray-400 font-bold">2026 EDITION</span>
            </div>

            {/* Middle Main Headline */}
            <div className="my-auto z-10 space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                {selectedTitle}
              </h2>
              <p className="text-xs md:text-sm text-gray-300 font-medium">
                Empirical benchmarks, step-by-step frameworks, and institutional data.
              </p>
            </div>

            {/* Bottom Brand Ribbon */}
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between z-10 text-[11px]">
              <span className={`font-bold tracking-widest uppercase ${activeTheme.accent}`}>
                {activeTheme.tagline}
              </span>
              <span className="font-mono text-gray-500">NEXUS NETWORK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
