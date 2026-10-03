"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, CheckCircle, Tag, Eye, ChevronRight } from "lucide-react";
import CookieConsent from "../../../components/CookieConsent";
import NewsletterForm from "../../../components/NewsletterForm";
import ReadingProgressBar from "../../../components/ReadingProgressBar";
import ArticleAudioPlayer from "../../../components/ArticleAudioPlayer";
import TableOfContents from "../../../components/TableOfContents";
import AuthorBio from "../../../components/AuthorBio";
import CommunityPoll from "../../../components/CommunityPoll";

interface Article {
  id: string;
  title: string;
  niche: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  publishedAt: string | null;
  publishAt: string;
  viewCount?: number;
  tweetThread?: string[];
}

export default function SingleArticlePage({ params }: { params: { niche: string; slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const nicheNames: Record<string, string> = {
    news: "The Trend Matrix",
    crypto: "Crypto Daily",
    finance: "Wall St Insider",
  };
  const publicationName = nicheNames[params.niche] || "Nexus Media";

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((articles: Article[]) => {
        const found = articles.find((a) => a.slug === params.slug || a.id === params.slug);
        if (found) {
          setArticle(found);
          setRelated(articles.filter((a) => a.niche === found.niche && a.id !== found.id).slice(0, 3));
          // Increment view count
          fetch(`/api/articles/${found.id}/view`, { method: "POST" }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug, params.niche]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Guide Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">This article may have been archived or updated.</p>
        <Link href={`/${params.niche}`} className="px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500">
          Return to {publicationName}
        </Link>
      </div>
    );
  }

  const publishDate = article.publishedAt || article.publishAt || new Date().toISOString();

  // Convert markdown to clean rendered format with styled images
  const formattedContent = article.content
    .split("\n")
    .map((line, i) => {
      // Inline Markdown Images
      if (line.startsWith("![") && line.includes("](")) {
        const alt = line.substring(line.indexOf("[") + 1, line.indexOf("]"));
        const src = line.substring(line.indexOf("(") + 1, line.indexOf(")"));
        return (
          <div key={i} className="my-8 rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
            <img src={src} alt={alt} className="w-full max-h-[480px] object-cover" />
            <div className="p-3 text-center text-[11px] text-gray-500 font-mono bg-black/80">{alt}</div>
          </div>
        );
      }
      if (line.startsWith("# ")) {
        return null; // Title is in the header
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4 border-b border-gray-800 pb-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-bold text-gray-200 mt-6 mb-2">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-4 border-blue-500 bg-blue-950/20 p-4 rounded-r-xl my-4 text-xs text-blue-200 font-medium leading-relaxed">
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-5 list-disc text-gray-300 text-sm my-1">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
        return <p key={i} className="text-gray-300 text-sm my-2 font-medium">{line}</p>;
      }
      if (line.trim() === "---") {
        return <hr key={i} className="border-gray-800 my-8" />;
      }
      if (!line.trim()) {
        return <div key={i} className="h-3" />;
      }
      return <p key={i} className="text-gray-300 text-sm leading-relaxed my-2">{line}</p>;
    });

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Scroll Progress Bar */}
      <ReadingProgressBar />

      {/* Top Breadcrumb Nav */}
      <nav className="border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center text-xs">
          <Link
            href={`/${params.niche}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {publicationName}
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-800"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Link Copied" : "Share"}
            </button>
          </div>
        </div>
      </nav>

      {/* Article Header & Main Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Category & Time */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 bg-blue-950 text-blue-400 font-bold uppercase tracking-widest rounded-full border border-blue-900">
            {article.niche}
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {new Date(publishDate).toLocaleDateString()}
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 6 min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {article.title}
        </h1>

        <p className="text-lg text-gray-400 leading-relaxed mb-8 font-serif">
          {article.excerpt}
        </p>

        {/* AI Audio Narration Widget */}
        <ArticleAudioPlayer title={article.title} readTime="6 min" />

        {/* Hero Photo with Overlay Caption */}
        {article.image && (
          <div className="relative rounded-3xl overflow-hidden mb-12 border border-gray-800 shadow-2xl">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[380px] md:h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs text-gray-300 font-mono">
                Photo by Unsplash / Verified Editorial Coverage &copy; 2026 {publicationName}
              </span>
            </div>
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents content={article.content} />

        {/* Body Content */}
        <div className="prose prose-invert max-w-none text-gray-300">
          {formattedContent}
        </div>

        {/* E-E-A-T Verified Author & Reviewer Box */}
        <AuthorBio niche={article.niche} />

        {/* Reader Sentiment Poll */}
        <CommunityPoll />

        {/* Interactive Newsletter */}
        <div className="mt-14">
          <NewsletterForm niche={article.niche} variant="inline" />
        </div>

        {/* Related Articles Carousel/Grid */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">Recommended Intelligence Briefs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${rel.niche}/${rel.slug}`}
                  className="p-5 rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {rel.image && (
                      <div className="rounded-xl overflow-hidden mb-3 h-32">
                        <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500 mt-4 flex items-center gap-1">
                    Read Analysis <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black mt-20 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>{publicationName} &copy; 2026 • Nexus Autonomous Media Network</div>
          <div className="flex gap-6">
            <Link href={`/${params.niche}/about`} className="hover:text-white">About</Link>
            <Link href={`/${params.niche}/privacy-policy`} className="hover:text-white">Privacy</Link>
            <Link href={`/${params.niche}/terms`} className="hover:text-white">Terms</Link>
            <Link href={`/${params.niche}/contact`} className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}
