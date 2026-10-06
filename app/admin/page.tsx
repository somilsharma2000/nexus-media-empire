"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, Activity, Zap, Globe, MessageSquare, Play, CheckCircle, 
  LayoutDashboard, BrainCircuit, Image as ImageIcon, X, Copy, ChevronRight, 
  TrendingUp, Briefcase, LineChart, Lock, Menu,
  Database, RefreshCw, Power, Sliders, Brain, Code2, Key, PieChart, BarChart, Layers,
  Inbox, Share2, ShieldCheck, Sparkles, Tag, Link2, Mail, Clock, Palette, Package, Flame, Building, CreditCard, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RevenueDashboard from "../../components/RevenueDashboard";
import AdSlotManager from "../../components/AdSlotManager";
import AffiliateManager from "../../components/AffiliateManager";
import AlertFeed from "../../components/AlertFeed";
import PipelineStatus from "../../components/PipelineStatus";
import RisingKeywords from "../../components/RisingKeywords";
import QAConfigPanel from "../../components/QAConfigPanel";
import CookieConsent from "../../components/CookieConsent";
import SettingsPanel from "../../components/SettingsPanel";
import ConnectionsHub from "../../components/ConnectionsHub";
import AutomationControls from "../../components/AutomationControls";
import TopicManager from "../../components/TopicManager";
import ArticleManager from "../../components/ArticleManager";
import SocialDistribution from "../../components/SocialDistribution";
import BacklinkManager from "../../components/BacklinkManager";
import NewsletterManager from "../../components/NewsletterManager";
import PosterStudio from "../../components/PosterStudio";
import GodModeHub from "../../components/GodModeHub";
import OmniSocialDashboard from "../../components/OmniSocialDashboard";
import DigitalProductManager from "../../components/DigitalProductManager";
import ViralHookStudio from "../../components/ViralHookStudio";
import BehavioralAnalyticsPanel from "../../components/BehavioralAnalyticsPanel";
import SponsorManager from "../../components/SponsorManager";
import AdminSecurityGate from "../../components/AdminSecurityGate";
import MonetizationBlueprint from "../../components/MonetizationBlueprint";
import RazorpayGatewayHub from "../../components/RazorpayGatewayHub";
import MetaAgencyStudio from "../../components/MetaAgencyStudio";
import AdNetworkHub from "../../components/AdNetworkHub";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

function NavItem({ icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
        active 
          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold shadow-sm" 
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`w-4 h-4 transition-colors ${active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, onClick, subtitle }: { title: string; value: string; icon: React.ReactNode; onClick?: () => void; subtitle?: string }) {
  return (
    <div 
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#090d16] border border-gray-800/80 hover:border-gray-700 transition-all cursor-pointer shadow-lg space-y-2 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">{title}</span>
        <div className="p-2 rounded-xl bg-gray-800/50 text-gray-300 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      {subtitle && <p className="text-[11px] text-gray-500 font-mono">{subtitle}</p>}
    </div>
  );
}

export default function NexusDashboard() {
  const [currentView, setCurrentView] = useState("godmode");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const [liveStats, setLiveStats] = useState<{
    todayRevenue: number;
    totalLifetimeRevenue: number;
    pageviews: number;
    articlesCount: number;
    subscribersCount: number;
    sponsorInquiriesCount: number;
  }>({
    todayRevenue: 0,
    totalLifetimeRevenue: 0,
    pageviews: 0,
    articlesCount: 90,
    subscribersCount: 0,
    sponsorInquiriesCount: 0
  });

  useEffect(() => {
    async function loadLiveStats() {
      try {
        const [revRes, artRes] = await Promise.all([
          fetch("/api/analytics/revenue"),
          fetch("/api/articles")
        ]);
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData?.network) {
            setLiveStats((prev) => ({
              ...prev,
              todayRevenue: revData.network.todayRevenue || 0,
              totalLifetimeRevenue: revData.network.totalLifetimeRevenue || 0,
              pageviews: revData.network.pageviews || 0,
              subscribersCount: revData.network.subscribersCount || 0,
              sponsorInquiriesCount: revData.network.sponsorInquiriesCount || 0
            }));
          }
        }
        if (artRes.ok) {
          const artData = await artRes.json();
          if (Array.isArray(artData)) {
            setLiveStats((prev) => ({ ...prev, articlesCount: artData.length }));
          }
        }
      } catch (err) {
        console.error("Failed to load live admin stats", err);
      }
    }
    loadLiveStats();
  }, []);

  const showToast = (message: string, type = "success") => { 
    setToast({ message, type }); 
    setTimeout(() => setToast(null), 3000); 
  };

  const renderNavLinks = (closeOnClick = false) => (
    <div className="space-y-6">
      {/* 1. OVERVIEW & REVENUE */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 font-mono">Overview &amp; Control</p>
        <NavItem icon={<Zap />} label="God-Mode Control" active={currentView === "godmode"} onClick={() => { setCurrentView("godmode"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<LayoutDashboard />} label="Command Center" active={currentView === "dashboard"} onClick={() => { setCurrentView("dashboard"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<TrendingUp />} label="Revenue &amp; Analytics" active={currentView === "analytics"} onClick={() => { setCurrentView("analytics"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<ShieldCheck />} label="System Health" active={currentView === "health"} onClick={() => { setCurrentView("health"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* 2. CONTENT ENGINE */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 font-mono">Content Engine</p>
        <NavItem icon={<Sparkles />} label="Article Vault" active={currentView === "articles"} onClick={() => { setCurrentView("articles"); if (closeOnClick) setIsMobileMenuOpen(false); }} badge="90 Guides" />
        <NavItem icon={<Tag />} label="Topic Queue" active={currentView === "topics"} onClick={() => { setCurrentView("topics"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<RefreshCw />} label="Autonomous Pipeline" active={currentView === "autopilot"} onClick={() => { setCurrentView("autopilot"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Brain />} label="QA Gate Reviewer" active={currentView === "qaconfig"} onClick={() => { setCurrentView("qaconfig"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* 3. MONETIZATION */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 font-mono">Monetization Hub</p>
        <NavItem icon={<Globe />} label="Ad Networks &amp; Exchanges" active={currentView === "adnetworks"} onClick={() => { setCurrentView("adnetworks"); if (closeOnClick) setIsMobileMenuOpen(false); }} badge="9 Networks" />
        <NavItem icon={<Layers />} label="Ad Slot Manager" active={currentView === "adslots"} onClick={() => { setCurrentView("adslots"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Link2 />} label="Affiliate Links (/go)" active={currentView === "affiliates"} onClick={() => { setCurrentView("affiliates"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Building />} label="Sponsors &amp; Inquiries" active={currentView === "sponsors"} onClick={() => { setCurrentView("sponsors"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Package />} label="Digital Products" active={currentView === "products"} onClick={() => { setCurrentView("products"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<CreditCard />} label="Razorpay &amp; Checkout" active={currentView === "razorpay"} onClick={() => { setCurrentView("razorpay"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* 4. GROWTH & SOCIAL */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 font-mono">Distribution &amp; Growth</p>
        <NavItem icon={<Share2 />} label="Omni-Brand Socials" active={currentView === "omnisocial"} onClick={() => { setCurrentView("omnisocial"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Flame />} label="Viral Hook Studio" active={currentView === "hooks"} onClick={() => { setCurrentView("hooks"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Palette />} label="Promo Poster Studio" active={currentView === "posters"} onClick={() => { setCurrentView("posters"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<BarChart />} label="SEO Keywords Radar" active={currentView === "seo"} onClick={() => { setCurrentView("seo"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Mail />} label="Newsletter Engine" active={currentView === "newsletter"} onClick={() => { setCurrentView("newsletter"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Globe />} label="Backlink Tracker" active={currentView === "backlinks"} onClick={() => { setCurrentView("backlinks"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>

      {/* 5. INFRASTRUCTURE & SETTINGS */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 font-mono">Infrastructure</p>
        <NavItem icon={<Clock />} label="Chrono Automations" active={currentView === "automation"} onClick={() => { setCurrentView("automation"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Database />} label="Account Connections" active={currentView === "connections"} onClick={() => { setCurrentView("connections"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
        <NavItem icon={<Key />} label="Settings &amp; API Keys" active={currentView === "settings"} onClick={() => { setCurrentView("settings"); if (closeOnClick) setIsMobileMenuOpen(false); }} />
      </div>
    </div>
  );

  return (
    <AdminSecurityGate>
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#03060c] text-gray-100 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-[#090e18] border border-blue-500/40 text-blue-300 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono backdrop-blur-xl">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Mobile Navigation Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#060912] border-b border-gray-800/80 w-full z-30 shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-600/30">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-xs text-white tracking-wider font-mono">
                NEXUS<span className="text-blue-500">MEDIA</span>
              </span>
              <span className="text-[9px] text-gray-400 font-mono block -mt-0.5">Operator Command</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {currentView}
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-xl border border-gray-700 transition-colors"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Over Drawer */}
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
                className="bg-[#060912] w-4/5 max-w-xs h-full border-r border-gray-800 p-5 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-600 rounded-lg">
                        <BrainCircuit className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-xs text-white">Navigation</span>
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
                  Nexus Media Empire • Version 4.2
                </div>
              </motion.div>

              <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-72 border-r border-gray-800/80 bg-[#060912] p-5 flex-col justify-between shrink-0 select-none overflow-hidden h-full z-20">
          <div className="flex flex-col gap-6 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-2 pt-1">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/25 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                    NEXUS<span className="text-blue-500">MEDIA</span>
                  </h1>
                  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Command Center</p>
                </div>
              </Link>
            </div>
            
            <nav className="flex flex-col gap-5 overflow-y-auto pr-1 text-xs custom-scrollbar">
              {renderNavLinks(false)}
            </nav>
          </div>

          {/* System Telemetry Indicator */}
          <div className="bg-[#090e18] p-3.5 rounded-2xl border border-gray-800/80 mt-4 shrink-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">System Health</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 100% Operational
              </span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 w-[96%] h-full" />
            </div>
            <div className="text-[10px] text-gray-500 mt-2 flex justify-between font-mono">
              <Link href="/" className="text-blue-400 hover:underline">View Public Site →</Link>
              <span>Vercel Edge</span>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 relative flex flex-col h-screen overflow-y-auto bg-[#03060c]">
          <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
            
            {/* VIEW: GOD-MODE MASTER CONTROL */}
            {currentView === "godmode" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <GodModeHub />
              </motion.div>
            )}

            {/* VIEW: COMMAND CENTER */}
            {currentView === "dashboard" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
                <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">Executive Command Center</h2>
                    <p className="text-gray-400 text-sm mt-1">Autonomous multi-agent media network monitoring &amp; controls.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#080d18] px-4 py-2 rounded-full border border-gray-800 self-start md:self-auto shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-emerald-400">PIPELINE ACTIVE</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Active Network Guides" 
                    value={`${liveStats.articlesCount} Published`} 
                    icon={<Zap className="w-5 h-5 text-blue-400" />} 
                    onClick={() => setCurrentView("articles")} 
                    subtitle="100% E-E-A-T Verified" 
                  />
                  <StatCard 
                    title="Real-Time Pageviews" 
                    value={liveStats.pageviews > 0 ? liveStats.pageviews.toLocaleString() : "0 Views"} 
                    icon={<Eye className="w-5 h-5 text-cyan-400" />} 
                    onClick={() => setCurrentView("analytics")} 
                    subtitle="Live Edge Reader Traffic" 
                  />
                  <StatCard 
                    title="Live Network Revenue" 
                    value={`$${liveStats.todayRevenue.toFixed(2)}`} 
                    icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
                    onClick={() => setCurrentView("analytics")} 
                    subtitle={`$${liveStats.totalLifetimeRevenue.toFixed(2)} Lifetime Calculated`} 
                  />
                  <StatCard 
                    title="Subscribers & RFPs" 
                    value={`${liveStats.subscribersCount} / ${liveStats.sponsorInquiriesCount}`} 
                    icon={<Building className="w-5 h-5 text-purple-400" />} 
                    onClick={() => setCurrentView("sponsors")} 
                    subtitle="Email Readers & Sponsor Leads" 
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-blue-400" /> Multi-Domain Monetization Stream
                  </h3>
                  <RevenueDashboard />
                </div>
              </motion.div>
            )}

            {/* VIEW: REVENUE & ANALYTICS */}
            {currentView === "analytics" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-emerald-400" /> Revenue &amp; Multi-Domain Analytics
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Earnings telemetry across AdSense, direct sponsors, and high-CPA affiliate conversions.</p>
                </header>
                <RevenueDashboard />
              </motion.div>
            )}

            {/* VIEW: SYSTEM HEALTH */}
            {currentView === "health" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" /> System Health &amp; Failover Alerts
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Real-time health telemetry — site uptime, crawler status, and self-healing logs.</p>
                </header>
                <AlertFeed />
              </motion.div>
            )}

            {/* VIEW: ARTICLE VAULT */}
            {currentView === "articles" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-blue-400" /> Article Vault &amp; Publishing Desk
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Manage, preview, edit, and release high-grade evergreen articles across all publications.</p>
                </header>
                <ArticleManager />
              </motion.div>
            )}

            {/* VIEW: TOPIC INGESTION */}
            {currentView === "topics" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Tag className="w-8 h-8 text-cyan-400" /> Topic Ingestion &amp; Angle Backlog
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Prioritize high-value search queries and trigger instant multi-agent content generation.</p>
                </header>
                <TopicManager />
              </motion.div>
            )}

            {/* VIEW: AUTOPILOT PIPELINE */}
            {currentView === "autopilot" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-blue-400" /> Autonomous Publishing Pipeline
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Monitor the autonomous lifecycle: Trend Scout → 5-Dimension QA Gate → Scheduled Release.</p>
                </header>
                <PipelineStatus />
              </motion.div>
            )}

            {/* VIEW: QA CONFIG */}
            {currentView === "qaconfig" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-400" /> AI QA Gate &amp; Editorial Thresholds
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Tune the 5-dimension AI self-reviewer thresholds, budget cap, and auto-publish behavior.</p>
                </header>
                <QAConfigPanel />
              </motion.div>
            )}

            {/* VIEW: AD NETWORKS & EXCHANGES */}
            {currentView === "adnetworks" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <AdNetworkHub />
              </motion.div>
            )}

            {/* VIEW: AD SLOT MANAGER */}
            {currentView === "adslots" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Layers className="w-8 h-8 text-amber-400" /> Ad Slot &amp; Placement Engine
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Deploy responsive ad units across header, mid-feed, and sidebar placements.</p>
                </header>
                <AdSlotManager />
              </motion.div>
            )}

            {/* VIEW: AFFILIATE MANAGER */}
            {currentView === "affiliates" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Link2 className="w-8 h-8 text-emerald-400" /> High-Ticket Affiliate Bounties
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Manage cloaked referral links (/go/slug) with click tracking and FTC disclosure shields.</p>
                </header>
                <AffiliateManager />
              </motion.div>
            )}

            {/* VIEW: BRAND SPONSORS */}
            {currentView === "sponsors" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <SponsorManager />
              </motion.div>
            )}

            {/* VIEW: DIGITAL PRODUCTS */}
            {currentView === "products" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Package className="w-8 h-8 text-emerald-400" /> High-Margin Digital Products
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">100% margin digital product funnels: Cheatsheets, Notion Templates, and Calculators.</p>
                </header>
                <DigitalProductManager />
              </motion.div>
            )}

            {/* VIEW: RAZORPAY GATEWAY */}
            {currentView === "razorpay" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <RazorpayGatewayHub />
              </motion.div>
            )}

            {/* VIEW: OMNI-BRAND SOCIALS */}
            {currentView === "omnisocial" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Share2 className="w-8 h-8 text-cyan-400" /> Omni-Brand Social Distribution
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Multi-network syndication across X/Twitter, Reddit, and Medium with 1st-comment link protection.</p>
                </header>
                <OmniSocialDashboard />
              </motion.div>
            )}

            {/* VIEW: VIRAL HOOK STUDIO */}
            {currentView === "hooks" && (
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
            {currentView === "posters" && (
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
            {currentView === "seo" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <BarChart className="w-8 h-8 text-purple-400" /> SEO &amp; Rising Keyword Radar
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Identify breakout search terms and generate ranking articles with 1-click workflow.</p>
                </header>
                <RisingKeywords />
              </motion.div>
            )}

            {/* VIEW: NEWSLETTER HUB */}
            {currentView === "newsletter" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Mail className="w-8 h-8 text-indigo-400" /> Email Newsletter Engine &amp; Beehiiv Sync
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Manage owned subscriber audience, compose broadcast digests, and sync with Beehiiv.</p>
                </header>
                <NewsletterManager />
              </motion.div>
            )}

            {/* VIEW: BACKLINK AUTHORITY */}
            {currentView === "backlinks" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Globe className="w-8 h-8 text-blue-400" /> Backlink Network &amp; Citation Tracker
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Track high-DA backlink placements and manual outreach distribution.</p>
                </header>
                <BacklinkManager />
              </motion.div>
            )}

            {/* VIEW: AUTOMATION TIMERS */}
            {currentView === "automation" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Clock className="w-8 h-8 text-teal-400" /> Chrono Automation &amp; Timing Schedules
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Configure automated execution schedules for trend discovery, publishing, and weekly digests.</p>
                </header>
                <AutomationControls />
              </motion.div>
            )}

            {/* VIEW: ACCOUNT CONNECTIONS */}
            {currentView === "connections" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-400" /> External Service Integrations
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Connect your OpenAI, Google AdSense, Telegram, and Social API accounts in one unified panel.</p>
                </header>
                <ConnectionsHub />
              </motion.div>
            )}

            {/* VIEW: SETTINGS & KEYS */}
            {currentView === "settings" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <header>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Key className="w-8 h-8 text-amber-400" /> Global Environment &amp; Secret Keys
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Manage network parameters, security clearance credentials, and API environment variables.</p>
                </header>
                <SettingsPanel />
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </AdminSecurityGate>
  );
}
