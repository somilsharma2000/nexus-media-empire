"use client";

import React, { useState } from "react";
import { Share2, Bookmark, Check, Copy, ZoomIn, ZoomOut, MessageCircle, ExternalLink } from "lucide-react";

interface ReaderToolbarProps {
  title: string;
  url: string;
  onFontSizeChange?: (delta: number) => void;
}

export default function ReaderToolbar({ title, url, onFontSizeChange }: ReaderToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url || window.location.href)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleBookmark = () => {
    setSaved(!saved);
  };

  return (
    <div className="sticky top-20 z-30 mb-8 flex flex-wrap items-center justify-between gap-3 bg-gray-900/80 backdrop-blur-md border border-gray-800 p-3 rounded-2xl shadow-xl">
      {/* Left: Reading controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">Text Size:</span>
        <button
          onClick={() => onFontSizeChange && onFontSizeChange(-1)}
          className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
          title="Decrease font size"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => onFontSizeChange && onFontSizeChange(1)}
          className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
          title="Increase font size"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            saved
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "border-gray-800 hover:bg-gray-800 text-gray-300"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

        <button
          onClick={handleShareTwitter}
          className="px-2.5 py-1.5 hover:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-xl border border-gray-800 transition-colors text-xs font-bold"
          title="Share on X"
        >
          𝕏 Post
        </button>

        <button
          onClick={handleShareLinkedIn}
          className="px-2.5 py-1.5 hover:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-xl border border-gray-800 transition-colors text-xs font-bold"
          title="Share on LinkedIn"
        >
          in Share
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  );
}
