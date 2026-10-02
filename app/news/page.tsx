"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, Globe, ArrowRight, Zap, Share2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Article { id: number; title: string; category: string; time: string; excerpt: string; content?: string; image?: string; featured?: boolean; }

export default function PublicNewsAggregator() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // Auto-refresh every 5 seconds to catch new publishes
    const interval = setInterval(fetchArticles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-blue-500/30">
      
      {/* Global Network Switcher */}
      <div className="bg-gray-950 border-b border-gray-900 text-xs text-gray-400 py-2 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">Nexus Network Sites:</span>
          <span className="text-white font-bold cursor-pointer">global.thetrendmatrix.com</span>
          <span className="cursor-pointer hover:text-white transition-colors">tech.thetrendmatrix.com</span>
          <span className="cursor-pointer hover:text-white transition-colors">crypto.thetrendmatrix.com</span>
          <span className="cursor-pointer hover:text-white transition-colors">finance.thetrendmatrix.com</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-green-500 font-mono"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Network Active</span>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">THE TREND MATRIX</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-400">
            <span className="text-white cursor-pointer hover:text-blue-400 transition-colors">Latest News</span>
            <span className="cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-1"><Zap className="w-4 h-4"/> AI Automation</span>
            <span className="cursor-pointer hover:text-blue-400 transition-colors">Finance</span>
            <span className="cursor-pointer hover:text-blue-400 transition-colors">Crypto</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full border border-green-800/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Updates
            </span>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-[0_0_10px_rgba(37,99,235,0.4)]">
              Subscribe
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Breaking News Ticker */}
        <div className="flex items-center gap-4 bg-red-950/30 border border-red-900/50 p-3 rounded-lg mb-8">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
            <Zap className="w-3 h-3" /> BREAKING
          </span>
          <p className="text-sm text-red-200 truncate font-mono">
            Nexus AI System successfully deployed. Programmatic content engine is actively writing and publishing to this domain in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p>Syncing with Nexus Database...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
                <Globe className="w-12 h-12 mb-4 text-gray-600" />
                <p className="text-lg font-bold text-white mb-1">Awaiting AI Content</p>
                <p>Go to your Nexus Dashboard and click &quot;Publish Everywhere Now&quot;.</p>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {/* Featured Article (Top 1) */}
                  {articles.slice(0, 1).map(article => (
                    <motion.article 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={article.id} 
                      className="group cursor-pointer"
                      onClick={() => alert("Simulated: Redirecting to full article page...")}
                    >
                      <div className={`w-full h-80 rounded-2xl ${article.image || 'bg-gradient-to-br from-blue-900 to-black'} mb-6 border border-gray-800 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        <div className="absolute bottom-4 left-4 flex gap-2">
                           <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-bold text-blue-400 uppercase tracking-wider">
                             {article.category}
                           </span>
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors leading-tight">
                        {article.title}
                      </h1>
                      <p className="text-xl text-gray-400 mb-4 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-500"><TrendingUp className="w-4 h-4" /> Trending #1</span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>

                <div className="border-t border-gray-800 my-4"></div>

                <div className="grid md:grid-cols-2 gap-8">
                  <AnimatePresence>
                    {articles.slice(1).map((article, idx) => (
                      <motion.article 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        key={article.id} 
                        className="group cursor-pointer flex flex-col"
                        onClick={() => alert("Simulated: Redirecting to full article page...")}
                      >
                        <div className={`w-full h-48 rounded-xl ${article.image || 'bg-gradient-to-br from-gray-800 to-black'} mb-4 border border-gray-800 relative`}>
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                            {article.category}
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.time}</span>
                          <button className="text-gray-400 hover:text-white"><Share2 className="w-4 h-4" /></button>
                        </div>
                      </motion.article>
                    ))}
                    
                    {/* NATIVE AD INJECTION (Outbrain/Taboola style) */}
                    <motion.article 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="group cursor-pointer flex flex-col bg-gray-900/40 border border-gray-800 p-4 rounded-xl"
                        onClick={() => window.open('https://thetrendmatrix.com', '_blank')}
                      >
                        <div className="w-full h-40 rounded-lg bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center mb-4 relative">
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-gray-400 uppercase">Sponsored</div>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                          [Shocking] 1 Simple Trick To Automate Your Entire Business Workflow Overnight
                        </h2>
                        <p className="text-gray-500 text-xs mb-3 font-medium">Nexus Cloud Solutions</p>
                        <div className="mt-auto">
                          <button className="w-full py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-xs font-bold transition-colors">
                            Learn More ↗
                          </button>
                        </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Sidebar / Monetization Area */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            
            {/* ADVERTISEMENT BLOCK 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group cursor-pointer">
              <div className="absolute top-2 right-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sponsored Ad</div>
              <div className="text-center mt-4">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Build Your Own AI Empire</h3>
                <p className="text-sm text-gray-400 mb-6">Automate your entire business with Nexus AI today.</p>
                <span className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:bg-blue-500 transition-colors">
                  Learn More
                </span>
              </div>
            </div>

            {/* Newsletter Capture */}
            <div className="bg-gradient-to-b from-blue-900/20 to-black border border-blue-900/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">The Daily Briefing</h3>
              <p className="text-sm text-gray-400 mb-4">Get the top automated news delivered straight to your inbox.</p>
              <input type="email" placeholder="Enter your email" className="w-full bg-black border border-gray-700 rounded p-3 text-sm text-white mb-3 focus:outline-none focus:border-blue-500" />
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm transition-colors">
                Subscribe Free
              </button>
            </div>

            {/* ADVERTISEMENT BLOCK 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden cursor-pointer">
              <div className="absolute top-2 right-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">AdSense Space</div>
              <p className="text-gray-600 font-mono text-sm text-center">Google Display Network<br/>300x250</p>
            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
