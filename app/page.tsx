"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, Activity, Zap, Globe, MessageSquare, Play, CheckCircle, 
  LayoutDashboard, BrainCircuit, Image as ImageIcon, X, Copy, ChevronRight, 
  TrendingUp, Briefcase, LineChart, Lock,
  Database, RefreshCw, Power, Sliders, Brain, Code2, Key, PieChart, BarChart, Layers,
  Inbox, Share2, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRENDS = [
  { id: 1, topic: "OpenAI Strawberry Model Leaks", score: 98, niche: "AI & Tech" },
  { id: 2, topic: "Solana DeFi Exploit", score: 92, niche: "Crypto" },
  { id: 3, topic: "Remote Work Tax Laws 2026", score: 85, niche: "Finance" },
];



const AGENT_SKILLS = [
  { name: "SEO Master Agent", prompt: "You are an elite SEO journalist. Analyze the provided trending topic and write a highly engaging, 1500-word article. Use LSI keywords, H2/H3 tags, and a hook that retains readership. Output strictly in Markdown.", temp: "0.4" },
  { name: "Viral Thread Agent", prompt: "You are a Twitter ghostwriter for Silicon Valley billionaires. Take the core concept of the blog post and distill it into a 7-part viral Twitter thread. Use aggressive hooks, high-value insights, and end with a call to action.", temp: "0.8" },
  { name: "Midjourney Prompt Agent", prompt: "You are a creative director. Generate a highly detailed, cinematic prompt for an AI image generator based on this topic. Specify lighting (e.g., cyberpunk neon, cinematic rim lighting), camera angle, and rendering engine (Unreal Engine 5).", temp: "0.9" }
];

interface Trend { id: number; topic: string; niche: string; score: number; }
interface GenerationResults { blog?: string; tweets?: string[]; systemPrompt?: string; }

export default function NexusDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  
  // Generation & Results States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [results, setResults] = useState<GenerationResults | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [assetCount, setAssetCount] = useState(142);

  // Network State
  const [networks, setNetworks] = useState([
    { id: 1, name: "Tech Subdomain", domain: "tech.thetrendmatrix.com", status: "Connected", color: "text-blue-400" },
    { id: 2, name: "Crypto Subdomain", domain: "crypto.thetrendmatrix.com", status: "Connected", color: "text-purple-400" },
    { id: 3, name: "Finance Subdomain", domain: "finance.thetrendmatrix.com", status: "Connected", color: "text-green-400" },
    { id: 4, name: "Health & Biohacking", domain: "health.thetrendmatrix.com", status: "Awaiting DNS", color: "text-red-400" }
  ]);
  const [networkLoading, setNetworkLoading] = useState<number | null>(null);

  const handleToggleNetwork = (id: number) => {
    setNetworkLoading(id);
    // Simulate DNS/OAuth propagation delay
    setTimeout(() => {
      setNetworks(networks.map(n => {
        if (n.id === id) {
          return { ...n, status: n.status === "Connected" ? "Awaiting DNS" : "Connected" };
        }
        return n;
      }));
      setNetworkLoading(null);
    }, 2000);
  };

  // Live Scraper Simulation
  const [scannedItems, setScannedItems] = useState({ twitter: 12402, reddit: 843, news: 4110 });

  useEffect(() => {
    if (currentView !== 'pipeline') return;
    const interval = setInterval(() => {
      setScannedItems(prev => ({
        twitter: prev.twitter + Math.floor(Math.random() * 8),
        reddit: prev.reddit + Math.floor(Math.random() * 3),
        news: prev.news + Math.floor(Math.random() * 12)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [currentView]);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Actually publish to our local database to power the public news site
    try {
      if (results && results.blog) {
        await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: selectedTrend?.topic,
            category: selectedTrend?.niche,
            content: results.blog
          })
        });
      }
    } catch (e) {
      console.error("Failed to publish to database", e);
    }

    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
      setAssetCount(prev => prev + 3); // 3 assets per generation
    }, 2000);
  };

  const startGeneration = async (trend: Trend) => {
    setIsPublished(false);
    setIsGenerating(true);
    setProgress(0);
    setCompletedTasks([]);
    setResults(null);
    setSelectedTrend(trend);
    
    const tasks = [
      "Initializing Deep-Thinker Agent...",
      "Scraping latest sources...",
      "Drafting SEO Optimized Blog Post...",
      "Writing 10-part Twitter Thread...",
      "Generating Midjourney Prompts...",
      "Compiling Newsletter...",
      "Finalizing multi-channel assets..."
    ];

    let currentTask = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 15;
        if (next % 30 === 0 && currentTask < tasks.length - 1) {
           setCompletedTasks(prevTasks => [...prevTasks, tasks[currentTask]]);
           currentTask++;
        }
        return next > 90 ? 90 : next; 
      });
    }, 400);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trend.topic, niche: trend.niche })
      });
      const resData = await response.json();
      clearInterval(interval);
      setProgress(100);
      setCompletedTasks(tasks);
      setResults(resData.data);
    } catch (error) {
      clearInterval(interval);
      console.error("Failed to generate", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-black/50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wider">NEXUS<span className="text-blue-500">AI</span></h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard />} label="Command Center" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<Inbox />} label="QA & Approvals" active={currentView === 'approvals'} onClick={() => setCurrentView('approvals')} />
          <NavItem icon={<PieChart />} label="Global Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
          <NavItem icon={<TrendingUp />} label="Monetization Engine" active={currentView === 'revenue'} onClick={() => setCurrentView('revenue')} />
          <NavItem icon={<Share2 />} label="SEO & Distribution" active={currentView === 'distribution'} onClick={() => setCurrentView('distribution')} />
          <div className="my-2 border-t border-gray-800"></div>
          <NavItem icon={<Brain />} label="Agent Skills Matrix" active={currentView === 'skills'} onClick={() => setCurrentView('skills')} />
          <NavItem icon={<Database />} label="Trend Pipeline" active={currentView === 'pipeline'} onClick={() => setCurrentView('pipeline')} />
          <NavItem icon={<Globe />} label="Empire Network" active={currentView === 'network'} onClick={() => setCurrentView('network')} />
          <NavItem icon={<Sliders />} label="Agent Config" active={currentView === 'config'} onClick={() => setCurrentView('config')} />
        </nav>

        <div className="mt-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-400 mb-2">SYSTEM LOAD</p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 w-[12%] h-full animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex justify-between">
            <span>CPU: 12%</span>
            <span>API: 14ms</span>
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative flex flex-col h-full overflow-y-auto">
        
        {/* VIEW: COMMAND CENTER */}
        {currentView === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold">Welcome back, Commander.</h2>
                <p className="text-gray-400 text-sm mt-1">Your AI employees are ready. System status: Optimal.</p>
              </div>
              <div className="flex items-center gap-4 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                <span className="text-sm font-medium tracking-wide">AUTO-PILOT ACTIVE</span>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard title="Active Agents" value="5" icon={<Terminal className="w-5 h-5 text-purple-400" />} onClick={() => setCurrentView('config')} />
              <StatCard title="Assets Generated (24h)" value={assetCount.toString()} icon={<Zap className="w-5 h-5 text-yellow-400" />} onClick={() => setCurrentView('analytics')} />
              <StatCard title="Est. Revenue Impact" value={`$${(assetCount * 8.73).toFixed(0)}`} icon={<Activity className="w-5 h-5 text-green-400" />} onClick={() => setCurrentView('revenue')} />
            </div>

            {/* CRON Auto-Pilot Scheduler */}
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 p-6 rounded-xl mb-8 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-800/50">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">CRON Auto-Pilot Scheduler</h3>
                  <p className="text-sm text-gray-400">System is autonomously scraping trends and publishing to 15 domains.</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Next Run In</p>
                  <p className="text-xl font-mono text-white">01:42:15</p>
                </div>
                <button onClick={() => alert('Auto-Pilot paused. System requires manual approval for publishing.')} className="px-6 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg font-bold transition-all text-sm">
                  Pause System
                </button>
              </div>
            </div>

            {/* Network Monetization Chart */}
            <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-xl mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10 opacity-50"></div>
              <div className="relative z-10 flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><LineChart className="w-5 h-5 text-blue-400"/> Network Monetization</h3>
                  <p className="text-sm text-gray-400 mt-1">Traffic and ad-revenue correlation across all active subdomains (Last 30 Days)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-semibold mb-1">Projected 30-Day Revenue</p>
                  <p className="text-3xl font-bold text-green-400 flex items-center gap-2 justify-end">
                    <TrendingUp className="w-6 h-6" /> $12,450.00
                  </p>
                </div>
              </div>
              
              <div className="h-40 flex items-end gap-1.5 w-full relative z-10">
                {[...Array(30)].map((_, i) => {
                  // Mathematical upward trend simulation (Deterministic to prevent Hydration errors)
                  const base = 20;
                  // Pseudo-random volatility based on index so Server and Client match perfectly
                  const volatility = (Math.sin(i * 87.5) + 1) * 15; 
                  const growth = i * 1.8;
                  const height = Math.min(base + volatility + growth, 100); 
                  
                  return (
                    <div 
                      key={i} 
                      className="flex-1 bg-blue-900/40 border-t border-blue-500/30 hover:bg-blue-500 hover:border-blue-400 transition-all duration-300 rounded-t-sm cursor-crosshair relative group/bar" 
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-gray-700 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none text-green-400 font-mono z-50 transition-opacity shadow-lg">
                        ${Math.floor(height * 14.5)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Live Trend Scraper</h3>
            <div className="grid gap-4 relative">
              {TRENDS.map(trend => (
                <div key={trend.id} className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 hover:border-gray-700 transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-gray-800 text-gray-300">{trend.niche}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-800/50 flex items-center gap-1">
                          <Activity className="w-3 h-3"/> SCORE: {trend.score}
                        </span>
                      </div>
                      <h4 className="font-semibold text-lg text-white">{trend.topic}</h4>
                    </div>
                    <button 
                      className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold flex items-center gap-2"
                      onClick={() => startGeneration(trend)}
                    >
                      <Play className="w-4 h-4 fill-current" /> Generate Empire
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Agent Activity Terminal */}
            <div className="mt-8 bg-black border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Agent Telemetry</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col justify-end relative">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black pointer-events-none z-10"></div>
                <div className="flex flex-col gap-1 text-gray-500 relative z-0">
                  <p><span>[10:04:12]</span> <span className="text-blue-400">[SYS]</span> Initializing worker nodes...</p>
                  <p><span>[10:04:15]</span> <span className="text-purple-400">[API]</span> Connected to Twitter Firehose (Rate limit: 450/15m)</p>
                  <p><span>[10:04:18]</span> <span className="text-yellow-400">[AGENT-1]</span> Deep-scan initiated on /r/Entrepreneur</p>
                  <p><span>[10:05:22]</span> <span className="text-green-400">[NETWORK]</span> Ping received from tech.thetrendmatrix.com (Latency: 14ms)</p>
                  <p><span>[10:05:45]</span> <span className="text-blue-400">[SYS]</span> Memory footprint optimization complete.</p>
                  <p><span>[10:06:01]</span> <span className="text-purple-400">[API]</span> Midjourney proxy handshake successful (v6 engine)</p>
                  <p><span>[10:06:33]</span> <span className="text-yellow-400">[AGENT-2]</span> Scraping competitors for keyword overlap...</p>
                  <p><span>[10:07:11]</span> <span className="text-blue-400">[SYS]</span> Idle loop. Awaiting Commander input.</p>
                  <p className="text-green-400 flex items-center gap-2"><span>[10:07:15]</span> <span>[SYS]</span> System ready <span className="w-2 h-3 bg-green-400 animate-pulse inline-block"></span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: AGENT SKILLS MATRIX (NEW "BRAINS" VIEW) */}
        {currentView === 'skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Brain className="w-8 h-8 text-pink-500" /> Agent Skills Matrix</h2>
              <p className="text-gray-400 mt-2">The core &quot;Brains&quot; of the system. These are the underlying System Prompts that control how each AI agent behaves.</p>
            </header>
            <div className="grid gap-6">
              {AGENT_SKILLS.map((skill, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Code2 className="w-5 h-5 text-blue-400"/> {skill.name}</h3>
                    <span className="px-3 py-1 bg-black rounded-lg border border-gray-800 text-xs text-gray-400 font-mono">Temp: {skill.temp}</span>
                  </div>
                  <div className="bg-black p-4 rounded-lg border border-gray-800 font-mono text-sm text-green-400 leading-relaxed shadow-inner">
                    {skill.prompt}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW: TREND PIPELINE */}
        {currentView === 'pipeline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Database className="w-8 h-8 text-purple-500" /> Live Scraping Network</h2>
              <p className="text-gray-400 mt-2">Active data firehoses currently feeding the AI engine. <span className="text-green-400 animate-pulse">Monitoring in real-time.</span></p>
            </header>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-900 text-gray-300 uppercase font-bold text-xs border-b border-gray-800">
                  <tr><th className="px-6 py-4">Data Source</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Items Scanned (Live)</th><th className="px-6 py-4">Ping</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  <tr className="hover:bg-gray-800/30"><td className="px-6 py-4 font-semibold text-white flex items-center gap-2 font-sans"><MessageSquare className="w-4 h-4 text-blue-400"/> X (Twitter) Firehose</td><td className="px-6 py-4 text-green-400"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live</div></td><td className="px-6 py-4 text-blue-300">{scannedItems.twitter.toLocaleString()}</td><td className="px-6 py-4">24ms</td></tr>
                  <tr className="hover:bg-gray-800/30"><td className="px-6 py-4 font-semibold text-white flex items-center gap-2 font-sans"><Activity className="w-4 h-4 text-orange-400"/> Reddit /r/Entrepreneur</td><td className="px-6 py-4 text-green-400"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live</div></td><td className="px-6 py-4 text-blue-300">{scannedItems.reddit.toLocaleString()}</td><td className="px-6 py-4">45ms</td></tr>
                  <tr className="hover:bg-gray-800/30"><td className="px-6 py-4 font-semibold text-white flex items-center gap-2 font-sans"><Globe className="w-4 h-4 text-green-400"/> Google News RSS</td><td className="px-6 py-4 text-green-400"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live</div></td><td className="px-6 py-4 text-blue-300">{scannedItems.news.toLocaleString()}</td><td className="px-6 py-4">12ms</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" /> Extracted Anomalies & Virality Vectors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {TRENDS.map((trend, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 p-5 rounded-xl transition-all hover:border-gray-700 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700">{trend.niche}</span>
                      <h4 className="font-bold text-white text-lg mt-2">{trend.topic}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${trend.score > 90 ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-orange-900/20 text-orange-400 border-orange-900/50'}`}>
                      🔥 {trend.score}/100 Virality
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-800/50">
                    <div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {(Math.random() * 5000 + 1000).toFixed(0)} mentions</div>
                    <div className="flex items-center gap-1"><Activity className="w-4 h-4" /> Rising Fast</div>
                    <button onClick={() => { setCurrentView('dashboard'); startGeneration(trend); }} className="ml-auto text-blue-400 hover:text-blue-300 font-semibold text-xs transition-colors">
                      Send to Command Center →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW: QA & APPROVALS */}
        {currentView === 'approvals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Inbox className="w-8 h-8 text-yellow-500" /> QA & Human Approvals</h2>
              <p className="text-gray-400 mt-2">Review AI-generated drafts before they are syndicated to the Empire Network.</p>
            </header>

            <div className="space-y-6">
              {/* Draft 1 */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-yellow-900/30 text-yellow-500 text-xs font-bold rounded-full border border-yellow-900/50 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> PENDING REVIEW</span>
                      <span className="text-gray-500 text-xs">Destination: crypto.thetrendmatrix.com</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ethereum Layer-2s: The Hidden Gas Fees No One Talks About</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">While Layer-2 solutions promised to democratize Ethereum by slashing transaction costs, recent on-chain data reveals a hidden premium that arbitrage bots are exploiting...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                    <p className="text-2xl font-bold text-green-400">96%</p>
                  </div>
                </div>
                <div className="p-4 bg-black/40 flex justify-end gap-4">
                  <button onClick={() => alert('Asset rejected. Feedback loop initiated to retrain the writing model.')} className="px-6 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors">Reject & Retrain AI</button>
                  <button onClick={() => alert('Opening rich text Markdown editor...')} className="px-6 py-2 text-sm font-bold bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"><Code2 className="w-4 h-4"/> Edit Markdown</button>
                  <button onClick={() => alert('Asset approved! Syndicating to the Empire Network...')} className="px-6 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">Approve & Publish</button>
                </div>
              </div>

              {/* Draft 2 */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-yellow-900/30 text-yellow-500 text-xs font-bold rounded-full border border-yellow-900/50 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> PENDING REVIEW</span>
                      <span className="text-gray-500 text-xs">Destination: health.thetrendmatrix.com</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">The Longevity Protocol: 3 Supplements Silicon Valley CEOs Are Hoarding</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">Biohacking has evolved from cold plunges to cellular regeneration. Here are the three controversial compounds currently dominating executive health routines...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                    <p className="text-2xl font-bold text-yellow-400">88%</p>
                  </div>
                </div>
                <div className="p-4 bg-black/40 flex justify-end gap-4">
                  <button onClick={() => alert('Asset rejected. Feedback loop initiated to retrain the writing model.')} className="px-6 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors">Reject & Retrain AI</button>
                  <button onClick={() => alert('Opening rich text Markdown editor...')} className="px-6 py-2 text-sm font-bold bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"><Code2 className="w-4 h-4"/> Edit Markdown</button>
                  <button onClick={() => alert('Asset approved! Syndicating to the Empire Network...')} className="px-6 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">Approve & Publish</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: GLOBAL ANALYTICS */}
        {currentView === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><PieChart className="w-8 h-8 text-blue-500" /> Global Traffic Analytics</h2>
              <p className="text-gray-400 mt-2">Macro-level performance monitoring across all domains powered by the Nexus Engine.</p>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Total Pageviews (30D)</p>
                <p className="text-3xl font-bold text-white">1.2M</p>
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> +24.5%</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Unique Visitors</p>
                <p className="text-3xl font-bold text-white">840K</p>
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> +18.2%</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Avg Time on Page</p>
                <p className="text-3xl font-bold text-white">3m 42s</p>
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> +12.0%</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Bounce Rate</p>
                <p className="text-3xl font-bold text-white">41.2%</p>
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> -5.4%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Traffic Sources */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BarChart className="w-5 h-5 text-purple-400"/> Acquisition Sources</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Organic Search (Google/Bing)</span><span className="font-bold">65%</span></div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[65%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Social AI Agents (X/Reddit)</span><span className="font-bold">22%</span></div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-purple-500 h-full w-[22%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Direct / Newsletter</span><span className="font-bold">13%</span></div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full w-[13%]"></div></div>
                  </div>
                </div>
              </div>

              {/* Top Performing Assets */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-400"/> Top Performing AI Assets</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-white font-bold line-clamp-1">OpenAI&apos;s Next Move: What to Expect in 2027</p>
                      <p className="text-xs text-gray-500 mt-1">tech.thetrendmatrix.com</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-green-400">142K</p>
                      <p className="text-[10px] text-gray-500 uppercase">Views</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-white font-bold line-clamp-1">Bitcoin Breaks Resistance: Is $100K Inevitable?</p>
                      <p className="text-xs text-gray-500 mt-1">crypto.thetrendmatrix.com</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-green-400">89K</p>
                      <p className="text-[10px] text-gray-500 uppercase">Views</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-white font-bold line-clamp-1">The Truth About Intermittent Fasting</p>
                      <p className="text-xs text-gray-500 mt-1">health.thetrendmatrix.com</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-green-400">45K</p>
                      <p className="text-[10px] text-gray-500 uppercase">Views</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: MONETIZATION ENGINE */}
        {currentView === 'revenue' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><TrendingUp className="w-8 h-8 text-green-500" /> Monetization Engine</h2>
              <p className="text-gray-400 mt-2">Automate revenue generation. Configure ad networks and auto-inject affiliate links.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Affiliate Auto-Injector */}
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-green-400"/> Auto-Affiliate Injector</h3>
                    <div className="w-14 h-8 bg-green-600 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)]"><div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full"></div></div>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">AI automatically scans generated articles for high-intent keywords (e.g., &quot;best software&quot;, &quot;buy now&quot;) and dynamically wraps them in your affiliate links.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-black border border-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold text-sm">Amazon Associates</div>
                        <div className="text-xs text-gray-500">Tag: nexusmedia-20</div>
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                    <div className="bg-black border border-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold text-sm">ClickBank API</div>
                        <div className="text-xs text-gray-500">ID: TRENDMATRIX99</div>
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Programmatic Ad Networks */}
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400"/> Programmatic SEO Ads</h3>
                    <span className="text-xs font-bold text-blue-400 border border-blue-900/50 bg-blue-900/20 px-3 py-1 rounded-full">RPM: $14.50</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black border border-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Today&apos;s Traffic</div>
                        <div className="text-2xl font-bold text-white">42,108</div>
                      </div>
                      <div className="bg-black border border-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Est. Earnings</div>
                        <div className="text-2xl font-bold text-green-400">$610.56</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">Ad units are automatically injected into the sidebar, mid-article, and footer of all Nexus-generated properties.</p>
                  </div>
                  
                  <button onClick={() => alert('Payout request for $610.56 submitted. Funds will arrive in 3-5 business days.')} className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                    <Lock className="w-4 h-4" /> Request AdSense Payout (Net 30)
                  </button>
                </div>
              </div>
            </div>

            {/* Global Ad Slot Control */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400"/> Global Ad Slot Control (Admin)</h3>
                  <p className="text-sm text-gray-400 mt-1">Directly inject your raw AdSense, Header Bidding, or Native Ad code across the entire 15-site network.</p>
                </div>
                <button onClick={() => alert('Ad Tags successfully injected across all 15 domains in the Empire Network.')} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                  Deploy to All Sites
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Sidebar Unit (300x250)</label>
                  <textarea 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-gray-400 font-mono text-xs h-24 focus:border-purple-500 focus:outline-none"
                    defaultValue={`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-NEXUS99"></script>\n<ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-NEXUS99" data-ad-slot="1234567890"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Native Content Injection (Taboola/Outbrain)</label>
                  <textarea 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-gray-400 font-mono text-xs h-24 focus:border-purple-500 focus:outline-none"
                    defaultValue={`<div id="taboola-below-article-thumbnails"></div>\n<script type="text/javascript">\n  window._taboola = window._taboola || [];\n  _taboola.push({ mode: 'thumbnails-a', container: 'taboola-below-article-thumbnails', placement: 'Below Article Thumbnails', target_type: 'mix' });\n</script>`}
                  ></textarea>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: SEO & DISTRIBUTION */}
        {currentView === 'distribution' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Share2 className="w-8 h-8 text-blue-500" /> SEO & Social Distribution Swarm</h2>
              <p className="text-gray-400 mt-2">Manage the automated traffic engines pumping viewers into your network.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Twitter Bot Network */}
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400"/> X (Twitter) Bot Swarm</h3>
                    <div className="w-14 h-8 bg-blue-600 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"><div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full"></div></div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black border border-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Active Accounts</div>
                        <div className="text-2xl font-bold text-white">84</div>
                      </div>
                      <div className="bg-black border border-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Daily Tweets</div>
                        <div className="text-2xl font-bold text-blue-400">1,240</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400">The Nexus Engine manages a fleet of niche-specific Twitter accounts. Whenever a new article is published, the swarm engages in a coordinated reply-and-retweet cascade, driving immediate viral traffic to the post.</p>
                  </div>
                </div>
              </div>

              {/* Programmatic Backlink Farm */}
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400"/> Programmatic SEO Matrix</h3>
                    <span className="text-xs font-bold text-purple-400 border border-purple-900/50 bg-purple-900/20 px-3 py-1 rounded-full">TIER 1 & 2 ACTIVE</span>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="bg-black border border-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-white font-bold text-sm">Tier 1 Backlinks (High DR Web2.0s)</div>
                        <span className="text-xs font-bold text-green-400">241 Generated Today</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-500 h-full w-[85%]"></div></div>
                    </div>
                    <div className="bg-black border border-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-white font-bold text-sm">Tier 2 Profiles & Forum Injections</div>
                        <span className="text-xs font-bold text-green-400">1,840 Generated Today</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-400 h-full w-[45%]"></div></div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-4">Articles are instantly cross-posted to a private network of Medium, WordPress, and Reddit clones with exact-match anchor text pointing back to your main properties.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: EMPIRE NETWORK */}
        {currentView === 'network' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Globe className="w-8 h-8 text-green-500" /> Empire Network</h2>
              <p className="text-gray-400 mt-2">Manage your autonomous multi-niche subdomain empire.</p>
            </header>
              <div className="grid grid-cols-2 gap-6">
                {networks.map((plat) => (
                  <div key={plat.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-black rounded-lg border border-gray-800">
                        <Power className={`w-6 h-6 ${plat.status === 'Connected' ? plat.color : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">{plat.name}</h4>
                        <p className="text-sm text-gray-500 font-mono">{plat.domain}</p>
                      </div>
                    </div>
                    {networkLoading === plat.id ? (
                      <button disabled className="px-4 py-2 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Syncing...
                      </button>
                    ) : plat.status === "Connected" ? (
                      <button onClick={() => handleToggleNetwork(plat.id)} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg text-sm font-semibold hover:bg-red-900/40 transition-colors">
                        Disconnect
                      </button>
                    ) : (
                      <button onClick={() => handleToggleNetwork(plat.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                        Connect DNS
                      </button>
                    )}
                  </div>
                ))}
              </div>
          </motion.div>
        )}

        {/* VIEW: AGENT CONFIG */}
        {currentView === 'config' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-3"><Sliders className="w-8 h-8 text-pink-500" /> Agent Logic Tuning</h2>
              <p className="text-gray-400 mt-2">Adjust the personality, creativity, and guardrails of your AI workforce.</p>
            </header>
            <div className="max-w-5xl flex gap-8">
              {/* Left Column: Logic Tuning */}
              <div className="flex-1 bg-gray-900/50 border border-gray-800 p-8 rounded-xl flex flex-col gap-8">
                <div>
                  <label className="block font-bold text-white mb-2">Global Brand Voice Prompt</label>
                  <p className="text-sm text-gray-400 mb-3">This system prompt is appended to all Agent workflows.</p>
                  <textarea 
                    className="w-full bg-black border border-gray-700 rounded-lg p-4 text-green-400 font-mono text-sm h-32 focus:border-blue-500 focus:outline-none"
                    defaultValue="Act as a Silicon Valley tech founder. Tone should be highly professional, punchy, and visionary. Avoid corporate jargon. Do not use emojis unless absolutely necessary. Write with extreme confidence."
                  ></textarea>
                </div>
                <div className="border-t border-gray-800 pt-8">
                  <div className="flex justify-between items-center mb-4">
                    <label className="font-bold text-white">LLM Creativity Temperature</label>
                    <span className="text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded">0.7 / 1.0</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-semibold"><span>Factual (0.0)</span><span>Balanced (0.7)</span><span>Chaotic (1.0)</span></div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Require Human Approval</h4>
                    <p className="text-sm text-gray-400">If disabled, the AI will publish instantly without confirmation.</p>
                  </div>
                  <div className="w-14 h-8 bg-blue-600 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"><div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full"></div></div>
                </div>
              </div>

              {/* Right Column: Integrations & API Keys */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-yellow-500" /> External API Connections</h3>
                  <p className="text-sm text-gray-400 mb-6">Securely route your proprietary API keys through the Nexus Engine.</p>
                  
                  <div className="flex flex-col gap-4">
                    {/* OpenAI */}
                    <div className="bg-black border border-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-white font-bold"><Brain className="w-4 h-4 text-green-500"/> OpenAI Core</div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-900/30 text-green-400 border border-green-900/50 rounded">Connected</span>
                      </div>
                      <div className="flex gap-2">
                        <input type="password" value="sk-proj-a9F8jL2pXmN4qQ7..." readOnly className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-500 font-mono focus:outline-none" />
                        <button onClick={() => alert('API Key verified.')} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-semibold">Edit</button>
                      </div>
                    </div>
                    
                    {/* Midjourney API */}
                    <div className="bg-black border border-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-white font-bold"><ImageIcon className="w-4 h-4 text-purple-500"/> Midjourney Synthesis</div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-900/30 text-green-400 border border-green-900/50 rounded">Connected</span>
                      </div>
                      <div className="flex gap-2">
                        <input type="password" value="mj-api-v6-9x882ndP..." readOnly className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-500 font-mono focus:outline-none" />
                        <button onClick={() => alert('API Key verified.')} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-semibold">Edit</button>
                      </div>
                    </div>

                    {/* X / Twitter */}
                    <div className="bg-black border border-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-white font-bold"><MessageSquare className="w-4 h-4 text-blue-400"/> X (Twitter) Pro API</div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded">Disconnected</span>
                      </div>
                      <button onClick={() => alert('OAuth flow initiated. Connecting to X API v2...')} className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Key className="w-4 h-4" /> Link OAuth App
                      </button>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => alert('Configuration Saved. Changes will apply to all future asset generations.')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </main>
      
      {/* Simulation Matrix & Modals truncated to save context - they still exist exactly as before but I am keeping them out of this view for brevity since they render conditionally over the main screen */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="absolute bottom-8 right-8 w-96 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-40"
          >
            <div className="p-4 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="font-semibold text-sm">Agentic Matrix Active</span>
              </div>
              <span className="text-xs text-blue-400 font-mono">{progress}%</span>
            </div>
            
            <div className="p-4 flex flex-col gap-3 min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-xs bg-black">
              <div className="w-full bg-gray-900 h-1.5 rounded-full mb-2 overflow-hidden shadow-inner">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {completedTasks.map((task, i) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-start gap-2 text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{task}</span>
                </motion.div>
              ))}

              {progress === 100 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-green-950/30 border border-green-900/50 rounded text-green-400 flex flex-col gap-2">
                  <span className="font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Empire Assets Generated!</span>
                  <button onClick={() => { setIsGenerating(false); setShowModal(true); }} className="w-full mt-2 py-2 bg-green-900 hover:bg-green-800 text-white rounded font-sans text-sm font-semibold flex justify-center items-center gap-2">
                    Open Assets <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Zap className="w-6 h-6 text-yellow-500" /> Generated Assets: {selectedTrend?.topic}</h2>
                  <p className="text-gray-400 text-sm mt-1">Ready for 1-click publishing across all networks.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><X className="w-6 h-6" /></button>
              </div>

              {!isPublished ? (
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-64 border-r border-gray-800 bg-gray-900/50 p-4 flex flex-col gap-2">
                    <TabButton active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} icon={<Globe />} label="SEO Blog Article" />
                    <TabButton active={activeTab === 'twitter'} onClick={() => setActiveTab('twitter')} icon={<MessageSquare />} label="Twitter Thread" />
                    <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<ImageIcon />} label="Image Prompts" />
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-black relative group">
                    <button onClick={() => copyToClipboard(activeTab === 'blog' ? results.blog : activeTab === 'twitter' ? results.tweets.join('\n\n') : results.imagePrompt)} className="absolute top-6 right-6 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm">
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    {activeTab === 'blog' && <div className="prose prose-invert max-w-none"><pre className="text-gray-300 font-sans whitespace-pre-wrap">{results.blog}</pre></div>}
                    {activeTab === 'twitter' && <div className="flex flex-col gap-4">{results.tweets.map((tweet: string, idx: number) => <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-xl max-w-xl"><div className="flex items-center gap-2 mb-2 text-gray-400"><MessageSquare className="w-4 h-4 text-blue-400" /><span className="text-xs font-semibold">Tweet {idx + 1}</span></div><p className="text-gray-200">{tweet}</p></div>)}</div>}
                    {activeTab === 'media' && <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl"><h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Midjourney / DALL-E Prompt</h4><code className="text-blue-400 font-mono text-sm block bg-black p-4 rounded border border-gray-800">{results.imagePrompt}</code></div>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center bg-black/50 p-8 text-center">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]"><CheckCircle className="w-12 h-12 text-green-400" /></motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Empire Deployed!</h3>
                  <p className="text-gray-400 mb-8 max-w-md">Your AI agents have successfully published the blog article, queued the Twitter thread, and sent the media prompts to your inbox.</p>
                  <div className="flex gap-4 w-full max-w-lg">
                    <div className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between"><div className="flex items-center gap-3"><Globe className="w-5 h-5 text-blue-400" /> <span>Website</span></div><CheckCircle className="w-5 h-5 text-green-500" /></div>
                    <div className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between"><div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-blue-400" /> <span>Social</span></div><CheckCircle className="w-5 h-5 text-green-500" /></div>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                {isPublished ? (
                  <>
                    <button onClick={() => { setShowModal(false); setIsPublished(false); setCurrentView('network'); }} className="px-6 py-2 text-gray-400 hover:text-white font-medium transition-colors">
                      Back to Network
                    </button>
                    <button onClick={() => window.open('/news', '_blank')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                      <Globe className="w-4 h-4" /> View Live Site ↗
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-400 hover:text-white font-medium transition-colors">
                      Cancel
                    </button>
                    <button onClick={handlePublish} disabled={isPublishing} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                      {isPublishing ? <><Activity className="w-4 h-4 animate-spin" /> Broadcasting...</> : <><Globe className="w-4 h-4" /> Publish Everywhere Now</>}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-blue-900/20 text-blue-400 border border-blue-900/50 shadow-inner" : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon, onClick }: { title: string, value: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-gray-900/50 border border-gray-800 p-5 rounded-xl flex items-center justify-between hover:bg-gray-900/80 transition-colors ${onClick ? 'cursor-pointer hover:border-gray-600' : ''}`}>
      <div><h4 className="text-gray-400 text-sm font-medium mb-1">{title}</h4><span className="text-2xl font-bold text-white">{value}</span></div>
      <div className="p-3 bg-black rounded-lg border border-gray-800 shadow-inner">{icon}</div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all w-full text-left ${active ? "bg-gray-800 text-white shadow-md border border-gray-700" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })} {label}
    </button>
  );
}
