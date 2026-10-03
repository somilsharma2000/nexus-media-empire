"use client";

import { useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ArticleSearchProps {
  niche?: string;
  onSearchChange?: (query: string) => void;
}

export default function ArticleSearch({ niche = "news", onSearchChange }: ArticleSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (onSearchChange) onSearchChange(val);

    if (val.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(val)}&niche=${niche}`);
      const data = await res.json();
      if (data.articles) {
        setResults(data.articles);
      }
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    if (onSearchChange) onSearchChange("");
  };

  return (
    <div className="relative w-full max-w-xl mx-auto my-6">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={`Search ${niche === "news" ? "tech intelligence & AI" : niche === "crypto" ? "crypto & web3 analysis" : "financial strategies"}...`}
          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl pl-11 pr-10 py-3.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none shadow-xl transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 max-h-80 overflow-y-auto">
          {results.map((art) => (
            <Link
              key={art.id}
              href={`/${art.niche}/${art.slug || art.id}`}
              className="p-3 rounded-xl hover:bg-gray-900 flex items-center justify-between group transition-colors block text-left"
            >
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {art.title}
                </div>
                <div className="text-[11px] text-gray-400 truncate max-w-md mt-0.5">{art.excerpt}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
