"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, FileText, Send, Copy, Check, Eye, Code, Smartphone, Monitor,
  Sparkles, Layers, ShieldCheck, CreditCard, Users, Download, Zap,
  Award, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Plus, Globe
} from "lucide-react";

interface EmailTemplate {
  id: string;
  entity: string;
  category: string;
  name: string;
  subject: string;
  preheader: string;
  variables: string[];
  htmlTemplate: string;
}

export default function CommunicationsStudio() {
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  // Preview Controls
  const [previewMode, setPreviewMode] = useState<"visual" | "html" | "cards">("visual");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Variable Substitutions for Live Rendering
  const [testVars, setTestVars] = useState<Record<string, string>>({
    CUSTOMER_NAME: "Alex Vance",
    ITEM_NAME: "AI Quantitative Trading Bot Kit",
    ACCESS_KEY: "NX-DIG-K89X-A71F",
    AMOUNT: "49",
    CURRENCY: "USD",
    DOWNLOAD_URL: "http://localhost:3002/api/products/latest/download?key=NX-DIG-K89X-A71F",
    CLIENT_NAME: "Marcus Aurelius",
    COMPANY_NAME: "Ledger DeFi Protocol",
    INVOICE_ID: "INV-2026-001",
    DUE_DATE: "2026-10-15",
    TOTAL_AMOUNT: "3,500",
    PAYMENT_LINK: "http://localhost:3002/checkout?item=Q4+Exclusive+Sponsor+Takeover&amt=3500&cur=USD",
    LINE_ITEMS: "Wall St Insider & Crypto Daily Header Takeover (Q4)",
    IMPRESSIONS: "64,800",
    CLICKS: "3,120",
    CTR: "4.81",
    RENEWAL_RATE: "$2,800 / month",
    RENEWAL_LINK: "http://localhost:3002/checkout?item=Q4+Renewal+Retainer&amt=2800&cur=USD",
    SUBSCRIBER_EMAIL: "reader@familyoffice.co",
    NICHE_NAME: "Global Tech & Crypto Daily",
    LEAD_MAGNET_URL: "http://localhost:3002/downloads/2026_macro_blueprint.pdf",
    UNSUB_URL: "http://localhost:3002/unsubscribe",
    MEMBER_NAME: "Sarah Jenkins",
    ISSUE_NUM: "42",
    BRIEF_TOPIC: "Autonomous Agent Compute Arbitrage & Solana Liquidity Shocks",
    KEY_TAKEAWAYS: "1. Institutional liquidity rotated into high-throughput L1s.\n2. Multi-agent search citations grew +180% MoM.\n3. Algorithmic hedging reduced drawdowns to 1.4%.",
    DISCORD_LINK: "https://discord.gg/nexus-alpha",
    PARTNER_NAME: "CryptoAffiliate Pro",
    AFFILIATE_LINK: "http://localhost:3002/go/tradingview-pro",
    COMMISSION_RATE: "40",
    MEDIA_KIT_URL: "http://localhost:3002/advertise"
  });

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        if (data.templates && data.templates.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load email templates", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getRenderedHtml = (template: EmailTemplate | null) => {
    if (!template) return "";
    let html = template.htmlTemplate;
    Object.entries(testVars).forEach(([key, val]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, val);
    });
    return html;
  };

  const getRenderedSubject = (template: EmailTemplate | null) => {
    if (!template) return "";
    let subj = template.subject;
    Object.entries(testVars).forEach(([key, val]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      subj = subj.replace(regex, val);
    });
    return subj;
  };

  const filteredTemplates = selectedEntity === "all" 
    ? templates 
    : templates.filter(t => t.entity.toLowerCase() === selectedEntity.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-[#0d1624] via-[#09111c] to-[#0d1624] p-6 md:p-8 rounded-3xl border border-blue-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Communications & Templates Studio
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Multi-Entity Workflows
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Universal Cards, Popups & Email Templates
          </h2>
          <p className="text-gray-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Production-ready HTML & Markdown templates, license delivery certificates, sponsor invoices, exit-intent modals, and automated confirmation workflows for every network entity.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setPreviewMode("cards")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              previewMode === "cards" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-gray-800 text-gray-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Interactive UI Cards & Popups
          </button>
          <button
            onClick={fetchTemplates}
            className="p-2.5 bg-gray-900/80 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 transition-all"
            title="Refresh Templates"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE UI CARDS & POPUPS GALLERY */}
      {previewMode === "cards" ? (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Interactive UI Popups & Cards Gallery
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Live UI elements embedded across frontends and confirmation touchpoints.</p>
            </div>
            <button
              onClick={() => setPreviewMode("visual")}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono font-bold rounded-xl transition-all"
            >
              ← Back to Email Templates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CARD 1: DIGITAL PRODUCT LICENSE CERTIFICATE */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-blue-400 uppercase">1. Digital Product Delivery & License Grant Card</span>
                <span className="text-gray-500">Rendered upon Razorpay verification</span>
              </div>
              
              <div className="bg-[#080d16] border border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 text-blue-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> License Verified & Active
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">AI Quantitative Trading Bot Kit</h4>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-gray-400 bg-black/40 px-2.5 py-1 rounded-lg border border-gray-800">
                    ZIP + GitHub Repo
                  </span>
                </div>

                <div className="p-4 bg-[#05080e] rounded-2xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">Perpetual Access Key:</span>
                    <span className="text-blue-400 font-bold tracking-wider">NX-DIG-K89X-A71F</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">License Holder:</span>
                    <span className="text-gray-200">Alex Vance (alex.trading@hedgefund.io)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard("NX-DIG-K89X-A71F", "card_key")}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedId === "card_key" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Key
                  </button>
                  <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download (.ZIP)
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: SPONSOR PROFORMA INVOICE & TAX CARD */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase">2. Brand Sponsor Invoice & Checkout Card</span>
                <span className="text-gray-500">Auto-sent on proposal agreement</span>
              </div>

              <div className="bg-[#080d16] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      Tax Invoice #INV-2026-001
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">Ledger DeFi Protocol Header Retainer</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Amount: $3,500
                  </span>
                </div>

                <div className="p-4 bg-[#05080e] rounded-2xl border border-gray-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-400">
                    <span>Deliverable:</span>
                    <span className="text-gray-200">Wall St Insider 30-Day Header</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Due Date:</span>
                    <span className="text-gray-200">October 15, 2026 (Net 15)</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax/GST:</span>
                    <span className="text-emerald-400">0% Export / Tax Exempt</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl font-mono transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Pay via Razorpay Checkout Modal
                </button>
              </div>
            </div>

            {/* CARD 3: EXIT-INTENT LEAD MAGNET MODAL PREVIEW */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-purple-400 uppercase">3. Exit-Intent Lead Magnet Capture Modal</span>
                <span className="text-gray-500">Fires on cursor leave intent</span>
              </div>

              <div className="bg-[#080d16] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Before You Go</span>
                    <h4 className="text-base font-bold text-white">Free 2026 AI & Macro Blueprint</h4>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Join 28,000+ founders and quantitative traders receiving our weekly zero-noise intelligence briefs.
                </p>

                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your work email..."
                    className="w-full px-4 py-2.5 bg-[#05080e] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                  <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-lg shadow-purple-600/25">
                    Download Free Blueprint PDF →
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 4: VIP ALPHA ACCESS PASS & DISCORD BADGE */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase">4. VIP Alpha Member Pass & Signal Desk</span>
                <span className="text-gray-500">Delivered to $349/yr subscribers</span>
              </div>

              <div className="bg-gradient-to-br from-[#0c1017] to-[#151c28] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Official Member Pass
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">Nexus VIP Alpha Intelligence</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Tier: Institutional
                  </span>
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-gray-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-400">
                    <span>Member ID:</span>
                    <span className="text-amber-400">NX-VIP-P77V-Z33K</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Private Desk:</span>
                    <span className="text-gray-200">Telegram Alpha Room + Discord</span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-xl font-mono transition-all shadow-lg shadow-amber-600/25">
                  Launch Private Alpha Terminal →
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* VIEW 2: EMAIL TEMPLATES WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Template Selector by Entity */}
          <div className="space-y-4">
            
            {/* Entity Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-[#060910] p-1.5 rounded-2xl border border-gray-800">
              {["all", "Digital Products", "Brand Sponsors", "Newsletter Subscribers", "VIP Alpha Members", "Affiliate Partners"].map((ent) => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntity(ent)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all ${
                    selectedEntity === ent ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {ent}
                </button>
              ))}
            </div>

            {/* Template List Cards */}
            <div className="space-y-3">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTemplate?.id === tpl.id 
                      ? "bg-[#090e17] border-blue-500 shadow-xl shadow-blue-950/40" 
                      : "bg-[#060910] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-800 text-gray-300 uppercase">
                      {tpl.entity}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono">{tpl.category}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{tpl.name}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-1 font-mono">{tpl.subject}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Right Columns: Live Visual Preview & WYSIWYG Inspector */}
          <div className="lg:col-span-2 space-y-4">
            
            {selectedTemplate && (
              <div className="bg-[#090e17] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden space-y-4 p-6">
                
                {/* Header Controls */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTemplate.name}</h3>
                    <p className="text-xs font-mono text-blue-400 mt-0.5">Subject: {getRenderedSubject(selectedTemplate)}</p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    
                    <div className="flex items-center bg-[#060910] p-1 rounded-xl border border-gray-800">
                      <button
                        onClick={() => setPreviewMode("visual")}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${previewMode === "visual" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                      >
                        Visual
                      </button>
                      <button
                        onClick={() => setPreviewMode("html")}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${previewMode === "html" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                      >
                        Raw HTML
                      </button>
                    </div>

                    <div className="flex items-center bg-[#060910] p-1 rounded-xl border border-gray-800">
                      <button
                        onClick={() => setDeviceMode("desktop")}
                        className={`p-1.5 rounded-lg transition-all ${deviceMode === "desktop" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                        title="Desktop View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeviceMode("mobile")}
                        className={`p-1.5 rounded-lg transition-all ${deviceMode === "mobile" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                        title="Mobile View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Main Preview Container */}
                {previewMode === "visual" ? (
                  <div className="flex justify-center bg-[#030508] p-4 md:p-8 rounded-2xl border border-gray-850 overflow-x-auto min-h-[450px]">
                    <div
                      className={`transition-all bg-[#080d16] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl ${
                        deviceMode === "mobile" ? "w-[360px]" : "w-full max-w-[600px]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: getRenderedHtml(selectedTemplate) }}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <pre className="p-4 bg-[#030508] border border-gray-800 rounded-2xl text-xs font-mono text-gray-300 overflow-x-auto max-h-[450px]">
                      {getRenderedHtml(selectedTemplate)}
                    </pre>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-800 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(getRenderedHtml(selectedTemplate), "copy_html")}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedId === "copy_html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Raw HTML
                    </button>
                    <button
                      onClick={() => copyToClipboard(getRenderedSubject(selectedTemplate), "copy_subj")}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedId === "copy_subj" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Subject
                    </button>
                  </div>

                  <a
                    href={`mailto:client@example.com?subject=${encodeURIComponent(getRenderedSubject(selectedTemplate))}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Launch Email Client
                  </a>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
