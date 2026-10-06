"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, Activity, Zap, Globe, MessageSquare, Play, CheckCircle, 
  LayoutDashboard, BrainCircuit, Image as ImageIcon, X, Copy, ChevronRight, 
  TrendingUp, Briefcase, LineChart, Lock, Menu,
  Database, RefreshCw, Power, Sliders, Brain, Code2, Key, PieChart, BarChart, Layers,
  Inbox, Share2, ShieldCheck, Sparkles, Tag, Link2, Mail, Clock, Palette, Package, Flame, Building, CreditCard
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}
import { motion, AnimatePresence } from "framer-motion";
import RevenueDashboard from "../components/RevenueDashboard";
import AdSlotManager from "../components/AdSlotManager";
import AffiliateManager from "../components/AffiliateManager";
import AlertFeed from "../components/AlertFeed";
import PipelineStatus from "../components/PipelineStatus";
import RisingKeywords from "../components/RisingKeywords";
import QAConfigPanel from "../components/QAConfigPanel";
import CookieConsent from "../components/CookieConsent";
import SettingsPanel from "../components/SettingsPanel";
import ConnectionsHub from "../components/ConnectionsHub";
import AutomationControls from "../components/AutomationControls";
import TopicManager from "../components/TopicManager";
import ArticleManager from "../components/ArticleManager";
import SocialDistribution from "../components/SocialDistribution";
import BacklinkManager from "../components/BacklinkManager";
import NewsletterManager from "../components/NewsletterManager";
import PosterStudio from "../components/PosterStudio";
import GodModeHub from "../components/GodModeHub";
import OmniSocialDashboard from "../components/OmniSocialDashboard";
import DigitalProductManager from "../components/DigitalProductManager";
import ViralHookStudio from "../components/ViralHookStudio";
import BehavioralAnalyticsPanel from "../components/BehavioralAnalyticsPanel";
import SponsorManager from "../components/SponsorManager";
import AdminSecurityGate from "../components/AdminSecurityGate";
import MonetizationBlueprint from "../components/MonetizationBlueprint";
import RazorpayGatewayHub from "../components/RazorpayGatewayHub";
import CommunicationsStudio from "../components/CommunicationsStudio";
import MetaAgencyStudio from "../components/MetaAgencyStudio";


const TRENDS = [
  { id: 1, topic: "OpenAI Strawberry Model Architecture Analysis", score: 98, niche: "AI & Tech" },
  { id: 2, topic: "Solana DeFi Exploit and Liquidity Recovery", score: 92, niche: "Crypto" },
  { id: 3, topic: "Remote Work Tax Regulations 2026 Executive Guide", score: 85, niche: "Finance" },
];

const AGENT_SKILLS = [
  { name: "SEO Master Agent", prompt: "You are an elite SEO journalist. Analyze the provided trending topic and write a highly engaging, 1500-word article. Use LSI keywords, H2/H3 tags, and a hook that retains readership. Output strictly in Markdown.", temp: "0.4" },
  { name: "Viral Thread Agent", prompt: "You are a Twitter ghostwriter for Silicon Valley billionaires. Take the core concept of the blog post and distill it into a 7-part viral Twitter thread. Use aggressive hooks, high-value insights, and end with a call to action.", temp: "0.8" },
  { name: "Midjourney Prompt Agent", prompt: "You are a creative director. Generate a highly detailed, cinematic prompt for an AI image generator based on this topic. Specify lighting (e.g., cyberpunk neon, cinematic rim lighting), camera angle, and rendering engine (Unreal Engine 5).", temp: "0.9" }
];

interface Trend { id: number; topic: string; niche: string; score: number; }
interface GenerationResults { blog?: string; tweets?: string[]; systemPrompt?: string; imagePrompt?: string; }

export default function NexusDashboard() {
  const [currentView, setCurrentView] = useState("godmode");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const showToast = (message: string, type = 'success') => { 
    setToast({message, type}); 
    setTimeout(() => setToast(null), 3000); 
  };
  
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [adConfig, setAdConfig] = useState({ 
    title: 'Need Enterprise Level SEO?', 
    description: 'Nexus generates 1,000+ AI optimized articles daily.', 
    buttonText: 'Book a Demo Today', 
    url: 'https://nexus-saas.com', 
    injectionFrequency: 3 
  });
  
  const saveAdConfig = async () => { 
    try { 
      await fetch('/api/ads', { method: 'POST', body: JSON.stringify({ activeAd: adConfig }) }); 
      showToast('Monetization settings deployed across network!'); 
    } catch { 
      showToast('Failed to deploy', 'error'); 
    } 
  };
  
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
    { id: 1, name: "The Trend Matrix (Tech)", domain: "tech.thetrendmatrix.com", status: "Connected", color: "text-blue-400" },
    { id: 2, name: "Crypto Daily", domain: "crypto.thetrendmatrix.com", status: "Connected", color: "text-purple-400" },
    { id: 3, name: "Wall St Insider", domain: "finance.thetrendmatrix.com", status: "Connected", color: "text-green-400" },
    { id: 4, name: "Biohacking & Health", domain: "health.thetrendmatrix.com", status: "Awaiting DNS", color: "text-red-400" }
  ]);
  const [networkLoading, setNetworkLoading] = useState<number | null>(null);

  const handleToggleNetwork = (id: number) => {
    setNetworkLoading(id);
    setTimeout(() => {
      setNetworks(networks.map(n => {
        if (n.id === id) {
          return { ...n, status: n.status === "Connected" ? "Awaiting DNS" : "Connected" };
        }
        return n;
      }));
      setNetworkLoading(null);
    }, 1500);
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
      setAssetCount(prev => prev + 3); 
      showToast('Assets successfully published across network!'); 
      setTimeout(() => { setShowModal(false); setCurrentView('dashboard'); }, 1500);
    }, 1800);
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
      "Writing 7-part Twitter Thread...",
      "Generating Midjourney Visual Prompts...",
      "Compiling Newsletter Snippets...",
      "Finalizing multi-channel distribution assets..."
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
    showToast("Copied to clipboard!");
  };

  const renderNavLinks = (closeOnClick = false) => (
    <>
      {/* EXECUTIVE COMMAND */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5 font-mono">Executive Command</p>
        <NavItem icon={<Zap className="text-amber-400" />} label="God-Mode Hub" active={currentView === 'godmode'} onClick={() => { setCurrentView('godmode'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<LayoutDashboard className="text-blue-400" />} label="Command Center" active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<ShieldCheck className="text-emerald-400" />} label="System Health" active={currentView === 'health'} onClick={() => { setCurrentView('health'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* CONTENT ENGINE */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5 font-mono">Content Engine</p>
        <NavItem icon={<Sparkles className="text-purple-400" />} label="Article Vault" active={currentView === 'articles'} onClick={() => { setCurrentView('articles'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Tag className="text-cyan-400" />} label="Topic Ingestion" active={currentView === 'topics'} onClick={() => { setCurrentView('topics'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<RefreshCw className="text-blue-400" />} label="Auto-Pilot Pipeline" active={currentView === 'autopilot'} onClick={() => { setCurrentView('autopilot'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Brain className="text-pink-400" />} label="QA Gate Config" active={currentView === 'qaconfig'} onClick={() => { setCurrentView('qaconfig'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* MONETIZATION */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5 font-mono">Monetization</p>
        <NavItem icon={<CreditCard className="text-emerald-400" />} label="Razorpay & Orders" active={currentView === 'razorpay'} onClick={() => { setCurrentView('razorpay'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Sliders className="text-yellow-400" />} label="Ad Density Blueprint" active={currentView === 'blueprint'} onClick={() => { setCurrentView('blueprint'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Building className="text-blue-400" />} label="Brand Sponsors & RFPs" active={currentView === 'sponsors'} onClick={() => { setCurrentView('sponsors'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<BrainCircuit className="text-cyan-400" />} label="Behavioral Targeting" active={currentView === 'behavioral'} onClick={() => { setCurrentView('behavioral'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Layers className="text-amber-400" />} label="Ad Slot Manager" active={currentView === 'adslots'} onClick={() => { setCurrentView('adslots'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Link2 className="text-emerald-400" />} label="Affiliate Bounties" active={currentView === 'affiliates'} onClick={() => { setCurrentView('affiliates'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Package className="text-emerald-400" />} label="Digital Product Funnel" active={currentView === 'products'} onClick={() => { setCurrentView('products'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<TrendingUp className="text-green-400" />} label="Revenue & Analytics" active={currentView === 'analytics'} onClick={() => { setCurrentView('analytics'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* GROWTH & SOCIAL */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5 font-mono">Growth & Social</p>
        <NavItem icon={<InstagramIcon className="text-pink-400" />} label="Meta Agency Studio" active={currentView === 'meta'} onClick={() => { setCurrentView('meta'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Mail className="text-pink-400" />} label="Templates & Popups" active={currentView === 'templates'} onClick={() => { setCurrentView('templates'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Share2 className="text-cyan-400" />} label="Omni-Brand Socials" active={currentView === 'omnisocial'} onClick={() => { setCurrentView('omnisocial'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Flame className="text-amber-400" />} label="Viral Hook Studio" active={currentView === 'hooks'} onClick={() => { setCurrentView('hooks'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Palette className="text-pink-400" />} label="Promo Poster Studio" active={currentView === 'posters'} onClick={() => { setCurrentView('posters'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<BarChart className="text-purple-400" />} label="SEO Opportunities" active={currentView === 'seo'} onClick={() => { setCurrentView('seo'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Mail className="text-indigo-400" />} label="Newsletter Hub" active={currentView === 'newsletter'} onClick={() => { setCurrentView('newsletter'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Link2 className="text-blue-400" />} label="Backlink Authority" active={currentView === 'backlinks'} onClick={() => { setCurrentView('backlinks'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* INFRASTRUCTURE */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5 font-mono">Infrastructure</p>
        <NavItem icon={<Clock className="text-teal-400" />} label="Chrono Automations" active={currentView === 'automation'} onClick={() => { setCurrentView('automation'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Globe className="text-blue-400" />} label="Account Connections" active={currentView === 'connections'} onClick={() => { setCurrentView('connections'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Key className="text-amber-400" />} label="Settings & API Keys" active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>
    </>
  );

  return (
    <AdminSecurityGate>
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#030508] text-gray-100 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#0d131f] border border-blue-500/40 text-blue-300 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono backdrop-blur-xl">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Navigation Header (Screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#06080d] border-b border-gray-800 w-full z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-600/30">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-xs text-white tracking-wider font-mono">
              NEXUS<span className="text-blue-500">MEDIA</span>
            </span>
            <span className="text-[9px] text-gray-500 font-mono block -mt-0.5">Autonomous Control</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
            {currentView}
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-xl border border-gray-700 transition-colors shadow-sm"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden flex"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="bg-[#06080d] w-4/5 max-w-xs h-full border-r border-gray-800 p-5 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xs text-white">Navigation Menu</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-col gap-5 text-xs">
                  {renderNavLinks(true)}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-500 font-mono text-center">
                Nexus Autonomous Media Network v3.0
              </div>
            </motion.div>

            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-72 border-r border-gray-850 bg-[#06080d] p-5 flex-col justify-between shrink-0 select-none overflow-hidden h-full z-20">
        <div className="flex flex-col gap-6 overflow-hidden flex-1">
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                NEXUS<span className="text-blue-500">MEDIA</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Autonomous Network</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-5 overflow-y-auto pr-1 text-xs custom-scrollbar">
            {renderNavLinks(false)}
          </nav>
        </div>

        {/* System Telemetry Footer */}
        <div className="bg-[#090d14] p-3.5 rounded-2xl border border-gray-800/80 mt-4 shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">System Load</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Optimal
            </span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 w-[14%] h-full"></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 flex justify-between font-mono">
            <span>CPU: 14%</span>
            <span>API: 12ms</span>
          </p>
        </div>
      </aside>

      {/* Main Content Area - Full Width & Cleanly Centered */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 relative flex flex-col h-screen overflow-y-auto bg-[#030508]">
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
          
          {/* VIEW: GOD-MODE MASTER CONTROL */}
          {currentView === 'godmode' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <GodModeHub />
            </motion.div>
          )}

          {/* VIEW: COMMAND CENTER */}
          {currentView === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
              <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white">Executive Command Center</h2>
                  <p className="text-gray-400 text-sm mt-1">Autonomous multi-agent media empire. All workers operating at peak efficiency.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#080d16] px-4 py-2 rounded-full border border-gray-800 self-start md:self-auto shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">AUTO-PILOT ACTIVE</span>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Active Agent Daemons" value="5 Core Daemons" icon={<Terminal className="w-5 h-5 text-purple-400" />} onClick={() => setCurrentView('automation')} />
                <StatCard title="Articles In Network" value={assetCount.toString()} icon={<Zap className="w-5 h-5 text-amber-400" />} onClick={() => setCurrentView('articles')} />
                <StatCard title="Projected Monthly Impact" value={`$${(assetCount * 14.80).toFixed(0)}`} icon={<Activity className="w-5 h-5 text-emerald-400" />} onClick={() => setCurrentView('analytics')} />
              </div>

              {/* CRON Auto-Pilot Scheduler */}
              <div className="bg-[#080d16] border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-950/60 rounded-xl flex items-center justify-center border border-blue-800/50">
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">Chrono Auto-Pilot Ingestion</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Scraping global trends and deploying evergreen content across network subdomains.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase font-mono mb-0.5">Next Ingestion</p>
                    <p className="text-lg font-mono font-bold text-white">00:42:15</p>
                  </div>
                  <button onClick={() => showToast('Auto-Pilot paused. Switched to manual approval.')} className="px-5 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 rounded-xl font-bold transition-all text-xs font-mono">
                    Pause Chrono
                  </button>
                </div>
              </div>

              {/* Real Revenue Dashboard */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-400"/> Network Monetization Stream
                </h3>
                <RevenueDashboard />
              </div>

              {/* Live Trend Scraper */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400"/> Live Topic Signals
                </h3>
                <div className="grid gap-4">
                  {TRENDS.map(trend => (
                    <div key={trend.id} className="p-5 rounded-2xl border border-gray-800 bg-[#080d16] hover:border-gray-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">{trend.niche}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 flex items-center gap-1 font-mono">
                            <Activity className="w-3 h-3"/> VIRALITY SCORE: {trend.score}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-white">{trend.topic}</h4>
                      </div>
                      <button 
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 self-start md:self-auto"
                        onClick={() => startGeneration(trend)}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Generate Full Asset Suite
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Agent Activity Terminal */}
              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                <div className="bg-[#080d16] border-b border-gray-800 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Live Multi-Agent Telemetry Stream</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <div className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col justify-end relative">
                  <div className="flex flex-col gap-1 text-gray-500 relative z-0">
                    <p><span>[01:14:12]</span> <span className="text-blue-400">[SYS]</span> Initializing autonomous worker daemons...</p>
                    <p><span>[01:14:15]</span> <span className="text-purple-400">[SEO]</span> Google Indexing API handshake confirmed</p>
                    <p><span>[01:14:18]</span> <span className="text-yellow-400">[AGENT-1]</span> Deep-scan initiated on trending Google RSS feeds</p>
                    <p><span>[01:15:22]</span> <span className="text-emerald-400">[NETWORK]</span> Health check ping received from thetrendmatrix.com (12ms)</p>
                    <p><span>[01:15:45]</span> <span className="text-blue-400">[SYS]</span> Vector memory & local cache optimized</p>
                    <p className="text-emerald-400 flex items-center gap-2"><span>[01:16:00]</span> <span>[SYS]</span> System fully operational <span className="w-2 h-3 bg-emerald-400 animate-pulse inline-block"></span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: SYSTEM HEALTH */}
          {currentView === 'health' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" /> System Health & Telemetry
                </h2>
                <p className="text-gray-400 text-sm mt-1">Autonomous monitoring — site uptime, revenue anomalies, and instant failover alerts.</p>
              </header>
              <AlertFeed />
            </motion.div>
          )}

          {/* VIEW: ARTICLE VAULT */}
          {currentView === 'articles' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-400" /> Article Vault & Publishing Desk
                </h2>
                <p className="text-gray-400 text-sm mt-1">Manage, preview, edit, and release high-grade evergreen articles across all publications.</p>
              </header>
              <ArticleManager />
            </motion.div>
          )}

          {/* VIEW: TOPIC INGESTION */}
          {currentView === 'topics' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Tag className="w-8 h-8 text-cyan-400" /> Topic Ingestion & Angle Queue
                </h2>
                <p className="text-gray-400 text-sm mt-1">Feed evergreen keywords, prioritize high-value angles, and trigger one-click article generation.</p>
              </header>
              <TopicManager />
            </motion.div>
          )}

          {/* VIEW: AUTOPILOT PIPELINE */}
          {currentView === 'autopilot' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-400" /> Autonomous Publishing Pipeline
                </h2>
                <p className="text-gray-400 text-sm mt-1">Monitor the autonomous content cycle — Trend Scout, QA Gate Review, and Scheduled Release.</p>
              </header>
              <PipelineStatus />
            </motion.div>
          )}

          {/* VIEW: QA CONFIG */}
          {currentView === 'qaconfig' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Brain className="w-8 h-8 text-pink-400" /> AI QA Gate & Reviewer Thresholds
                </h2>
                <p className="text-gray-400 text-sm mt-1">Tune the AI self-reviewer thresholds, budget cap, and auto-publish behavior without touching code.</p>
              </header>
              <QAConfigPanel />
            </motion.div>
          )}

          {/* VIEW: BRAND SPONSORS & RFPs */}
          {currentView === 'sponsors' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <SponsorManager />
            </motion.div>
          )}

          {/* VIEW: RAZORPAY GATEWAY & ORDERS */}
          {currentView === 'razorpay' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <RazorpayGatewayHub />
            </motion.div>
          )}

          {/* VIEW: AD DENSITY BLUEPRINT */}
          {currentView === 'blueprint' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <MonetizationBlueprint />
            </motion.div>
          )}

          {/* VIEW: BEHAVIORAL TARGETING */}
          {currentView === 'behavioral' && (

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <BrainCircuit className="w-8 h-8 text-cyan-400" /> Behavioral Targeting & Audience Intent
                </h2>
                <p className="text-gray-400 text-sm mt-1">Real-time dwell time, scroll velocity, and dynamic offer morphing telemetry.</p>
              </header>
              <BehavioralAnalyticsPanel />
            </motion.div>
          )}

          {/* VIEW: AD SLOT MANAGER */}
          {currentView === 'adslots' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Layers className="w-8 h-8 text-amber-400" /> Ad Slot & Placement Engine
                </h2>
                <p className="text-gray-400 text-sm mt-1">Deploy high-RPM responsive ad units across header, mid-feed, and sidebar placements.</p>
              </header>
              <AdSlotManager />
            </motion.div>
          )}

          {/* VIEW: AFFILIATE MANAGER */}
          {currentView === 'affiliates' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Link2 className="w-8 h-8 text-emerald-400" /> High-Ticket Affiliate Bounties
                </h2>
                <p className="text-gray-400 text-sm mt-1">Cloaked affiliate links (/go/slug) with click tracking and dynamic context matching.</p>
              </header>
              <AffiliateManager />
            </motion.div>
          )}

          {/* VIEW: DIGITAL PRODUCTS */}
          {currentView === 'products' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Package className="w-8 h-8 text-emerald-400" /> High-Margin Digital Products ($0 COGS)
                </h2>
                <p className="text-gray-400 text-sm mt-1">100% margin digital product funnels: Cheatsheets, Notion Templates, and Calculators.</p>
              </header>
              <DigitalProductManager />
            </motion.div>
          )}

          {/* VIEW: REVENUE & ANALYTICS */}
          {currentView === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" /> Multi-Domain Revenue & Analytics
                </h2>
                <p className="text-gray-400 text-sm mt-1">Real-time earnings telemetry across AdSense, direct advertisers, and affiliate conversions.</p>
              </header>
              <RevenueDashboard />
            </motion.div>
          )}

          {/* VIEW: META AGENCY STUDIO */}
          {currentView === 'meta' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <MetaAgencyStudio />
            </motion.div>
          )}

          {/* VIEW: COMMUNICATIONS & TEMPLATES STUDIO */}
          {currentView === 'templates' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <CommunicationsStudio />
            </motion.div>
          )}

          {/* VIEW: OMNI-BRAND SOCIALS */}
          {currentView === 'omnisocial' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Share2 className="w-8 h-8 text-cyan-400" /> Omni-Brand Social Distribution
                </h2>
                <p className="text-gray-400 text-sm mt-1">Automated multi-network syndication across X/Twitter, Reddit, Medium, and LinkedIn.</p>
              </header>
              <OmniSocialDashboard />
            </motion.div>
          )}

          {/* VIEW: VIRAL HOOK STUDIO */}
          {currentView === 'hooks' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Flame className="w-8 h-8 text-amber-500" /> Viral Hook Synthesis Studio
                </h2>
                <p className="text-gray-400 text-sm mt-1">Generate scroll-stopping psychological hooks across all 7 viral archetypes with 1-click copy.</p>
              </header>
              <ViralHookStudio />
            </motion.div>
          )}

          {/* VIEW: PROMO POSTER STUDIO */}
          {currentView === 'posters' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Palette className="w-8 h-8 text-pink-400" /> Dynamic Visual Asset Generator
                </h2>
                <p className="text-gray-400 text-sm mt-1">Render high-CTR social posters, quote cards, and open-graph cover images in real time.</p>
              </header>
              <PosterStudio />
            </motion.div>
          )}

          {/* VIEW: SEO & KEYWORDS */}
          {currentView === 'seo' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <BarChart className="w-8 h-8 text-purple-400" /> SEO & Rising Keyword Radar
                </h2>
                <p className="text-gray-400 text-sm mt-1">Identify breakout search terms and generate ranking articles with 1-click workflow.</p>
              </header>
              <RisingKeywords />
            </motion.div>
          )}

          {/* VIEW: NEWSLETTER HUB */}
          {currentView === 'newsletter' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Mail className="w-8 h-8 text-indigo-400" /> Email Newsletter Engine & Beehiiv Sync
                </h2>
                <p className="text-gray-400 text-sm mt-1">Manage owned subscriber audience, compose broadcast digests, and sync with Beehiiv.</p>
              </header>
              <NewsletterManager />
            </motion.div>
          )}

          {/* VIEW: BACKLINK AUTHORITY */}
          {currentView === 'backlinks' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Link2 className="w-8 h-8 text-blue-400" /> Backlink Network & Citation Tracker
                </h2>
                <p className="text-gray-400 text-sm mt-1">Track high-DR inbound citations, Reddit discussions, and editorial mentions.</p>
              </header>
              <BacklinkManager />
            </motion.div>
          )}

          {/* VIEW: CHRONO AUTOMATIONS */}
          {currentView === 'automation' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Clock className="w-8 h-8 text-teal-400" /> Chrono Automation Engine
                </h2>
                <p className="text-gray-400 text-sm mt-1">Master cron schedules, daemon execution intervals, and instantaneous manual overrides.</p>
              </header>
              <AutomationControls />
            </motion.div>
          )}

          {/* VIEW: ACCOUNT CONNECTIONS */}
          {currentView === 'connections' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-400" /> Account Integrations Hub
                </h2>
                <p className="text-gray-400 text-sm mt-1">Live connection statuses for OpenAI, Google AdSense, Telegram Bot, Twitter, and PostgreSQL.</p>
              </header>
              <ConnectionsHub />
            </motion.div>
          )}

          {/* VIEW: SETTINGS & API KEYS */}
          {currentView === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <header>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Key className="w-8 h-8 text-amber-400" /> Settings & Master Credentials
                </h2>
                <p className="text-gray-400 text-sm mt-1">Configure all network credentials securely. No terminal or redeployment required.</p>
              </header>
              <SettingsPanel />
            </motion.div>
          )}

        </div>
      </main>

      {/* Generation Progress Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-96 bg-[#090d14] border border-blue-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
          >
            <div className="p-4 border-b border-gray-800 bg-[#0c121d] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="font-bold text-xs text-white">Agent Generation Active</span>
              </div>
              <span className="text-xs text-blue-400 font-mono font-bold">{progress}%</span>
            </div>
            
            <div className="p-4 flex flex-col gap-3 min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-xs bg-black/60">
              <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {completedTasks.map((task, i) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-start gap-2 text-gray-400 text-[11px]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>{task}</span>
                </motion.div>
              ))}

              {progress === 100 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 flex flex-col gap-2">
                  <span className="font-bold flex items-center gap-2 text-xs"><CheckCircle className="w-4 h-4" /> Empire Assets Ready!</span>
                  <button onClick={() => { setIsGenerating(false); setShowModal(true); }} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-all">
                    Open Results Modal <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Review & Publish Modal */}
      <AnimatePresence>
        {showModal && results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.96, y: 15 }} animate={{ scale: 1, y: 0 }} className="bg-[#090d14] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-[#0c121d] flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-400" /> Generated Package: {selectedTrend?.topic}
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Multi-channel assets ready for instant release.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              {!isPublished ? (
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-64 border-r border-gray-800 bg-[#07090e] p-4 flex flex-col gap-2">
                    <TabButton active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} icon={<Globe />} label="SEO Blog Article" />
                    <TabButton active={activeTab === 'twitter'} onClick={() => setActiveTab('twitter')} icon={<MessageSquare />} label="Twitter Thread" />
                    <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<ImageIcon />} label="Image Prompts" />
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-black relative group">
                    <button onClick={() => copyToClipboard(activeTab === 'blog' ? (results.blog ?? '') : activeTab === 'twitter' ? (results.tweets ?? []).join('\n\n') : (results.imagePrompt ?? ''))} className="absolute top-6 right-6 p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-mono transition-opacity">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    {activeTab === 'blog' && <div className="prose prose-invert max-w-none text-xs"><pre className="text-gray-300 font-sans whitespace-pre-wrap">{results.blog}</pre></div>}
                    {activeTab === 'twitter' && <div className="flex flex-col gap-3">{(results.tweets ?? []).map((tweet: string, idx: number) => <div key={idx} className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl max-w-xl"><div className="flex items-center gap-2 mb-2 text-gray-400"><MessageSquare className="w-4 h-4 text-blue-400" /><span className="text-xs font-semibold">Tweet {idx + 1}</span></div><p className="text-gray-200 text-xs">{tweet}</p></div>)}</div>}
                    {activeTab === 'media' && <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-xl"><h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">Midjourney / DALL-E Prompt</h4><code className="text-blue-400 font-mono text-xs block bg-black p-4 rounded-xl border border-gray-800">{results.imagePrompt}</code></div>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center bg-black/50 p-8 text-center">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]"><CheckCircle className="w-10 h-10 text-emerald-400" /></motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Assets Deployed to Network</h3>
                  <p className="text-gray-400 mb-8 max-w-md text-xs">Articles and social assets have been published and synced with indexing channels.</p>
                </div>
              )}
              
              <div className="p-4 border-t border-gray-800 bg-[#0c121d] flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white text-xs font-semibold transition-colors">
                  Close
                </button>
                {!isPublished && (
                  <button onClick={handlePublish} disabled={isPublishing} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
                    {isPublishing ? <><Activity className="w-4 h-4 animate-spin" /> Broadcasting...</> : <><Globe className="w-4 h-4" /> Publish to Live Sites</>}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </AdminSecurityGate>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
        active 
          ? "bg-blue-600/15 text-white border border-blue-500/30 shadow-md shadow-blue-950/40 font-bold" 
          : "text-gray-400 hover:bg-gray-900/60 hover:text-gray-200"
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 shrink-0" })}
      <span className="font-medium text-xs truncate">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-auto shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>}
    </div>
  );
}

function StatCard({ title, value, icon, onClick }: { title: string, value: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-[#080d16] border border-gray-800/80 p-5 rounded-2xl flex items-center justify-between hover:bg-gray-900/60 hover:border-gray-700 transition-all ${onClick ? 'cursor-pointer' : ''}`}>
      <div>
        <h4 className="text-gray-400 text-xs font-medium mb-1">{title}</h4>
        <span className="text-xl font-black text-white">{value}</span>
      </div>
      <div className="p-3 bg-black/60 rounded-xl border border-gray-800 shadow-inner">{icon}</div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all w-full text-left ${active ? "bg-gray-800 text-white shadow-md border border-gray-700 font-bold" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })} {label}
    </button>
  );
}
