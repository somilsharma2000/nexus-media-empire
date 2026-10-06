"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Key, 
  ExternalLink, Copy, Check, Search, Download, Plus, Zap, ArrowUpRight,
  Eye, EyeOff, Smartphone, Landmark, Wallet, Globe, Sparkles, Filter, Trash2,
  Users, UserCheck, DollarSign, TrendingUp, BarChart3, FileText, Send, PieChart,
  MousePointerClick, Compass, Award, Tag, Clock, ChevronRight, Activity, Percent
} from "lucide-react";
import InstantProductCheckoutModal from "./InstantProductCheckoutModal";

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  itemType: string;
  itemId?: string;
  itemTitle?: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: string;
  status: string;
  timestamp: string;
  accessKey?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  country: string;
  avatar: string;
  tier: string;
  status: string;
  totalSpentUsd: number;
  totalSpentInr: number;
  ordersCount: number;
  lastActive: string;
  tags: string[];
  notes: string;
  assignedRep?: string;
  deals?: any[];
}

interface Invoice {
  id: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentMethod: string;
  paymentRef?: string | null;
  items: Array<{ description: string; qty: number; rate: number; amount: number }>;
  notes: string;
}

interface WebhookLog {
  id: string;
  receivedAt: string;
  event: string;
  payload: any;
}

export default function RazorpayGatewayHub() {
  const [activeTab, setActiveTab] = useState<"cockpit" | "crm" | "invoices" | "clicks" | "ledger" | "credentials">("cockpit");
  
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [stats, setStats] = useState({ totalUSD: 0, totalINR: 0, count: 0, capturedCount: 0 });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [crmTierFilter, setCrmTierFilter] = useState("all");

  // Selected Customer for Profile Slide-Over Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustCompany, setNewCustCompany] = useState("");
  const [newCustTier, setNewCustTier] = useState("Warm Lead");
  const [newCustNotes, setNewCustNotes] = useState("");

  // Invoicing Modal
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invClientName, setInvClientName] = useState("");
  const [invClientEmail, setInvClientEmail] = useState("");
  const [invClientCompany, setInvClientCompany] = useState("");
  const [invCurrency, setInvCurrency] = useState("USD");
  const [invItemDesc, setInvItemDesc] = useState("Wall St Insider Header Sponsorship (30 Days)");
  const [invItemRate, setInvItemRate] = useState("3500");
  const [invTaxRate, setInvTaxRate] = useState("0");
  const [invNotes, setInvNotes] = useState("Net 15 terms. Razorpay online checkout link enabled.");

  // Printable Invoice View Modal
  const [activeInvoicePreview, setActiveInvoicePreview] = useState<Invoice | null>(null);

  // Credentials & Config
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Direct Test Checkout
  const [testCheckoutProduct, setTestCheckoutProduct] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Fetch all intelligence data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Transactions
      const resTxn = await fetch(`/api/payments/transactions?type=${filterType}&q=${encodeURIComponent(searchQuery)}`);
      const dataTxn = await resTxn.json();
      if (dataTxn.success) {
        setTransactions(dataTxn.transactions || []);
        setStats(dataTxn.stats || { totalUSD: 0, totalINR: 0, count: 0, capturedCount: 0 });
      }

      // 2. Customers CRM
      const resCrm = await fetch(`/api/crm/customers?tier=${crmTierFilter}&q=${encodeURIComponent(searchQuery)}`);
      const dataCrm = await resCrm.json();
      if (dataCrm.success) setCustomers(dataCrm.customers || []);

      // 3. Invoices
      const resInv = await fetch("/api/crm/invoices");
      const dataInv = await resInv.json();
      if (dataInv.success) setInvoices(dataInv.invoices || []);

      // 4. Webhooks
      const resWh = await fetch("/api/payments/webhooks");
      const dataWh = await resWh.json();
      if (dataWh.success) setWebhookLogs(dataWh.logs || []);

      // 5. 360 Analytics
      const resAn = await fetch("/api/crm/analytics");
      const dataAn = await resAn.json();
      if (dataAn.success) setAnalyticsData(dataAn.analytics);

      // 6. Settings
      const resSet = await fetch("/api/settings");
      const dataSet = await resSet.json();
      if (dataSet.settings) {
        setKeyId(dataSet.settings.RAZORPAY_KEY_ID || "");
        setKeySecret(dataSet.settings.RAZORPAY_KEY_SECRET || "");
        setWebhookSecret(dataSet.settings.RAZORPAY_WEBHOOK_SECRET || "");
      }
    } catch (err) {
      console.error("Failed to load intelligence data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, crmTierFilter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveCredentials = async () => {
    setIsSavingCreds(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RAZORPAY_KEY_ID: keyId,
          RAZORPAY_KEY_SECRET: keySecret,
          RAZORPAY_WEBHOOK_SECRET: webhookSecret,
          NEXT_PUBLIC_RAZORPAY_KEY_ID: keyId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback("Razorpay API credentials securely updated!");
      } else {
        setActionFeedback("Failed to save credentials");
      }
    } catch {
      setActionFeedback("Error saving credentials");
    } finally {
      setIsSavingCreds(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleTestGateway = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1,
          currency: "INR",
          itemTitle: "Diagnostic Connectivity Ping",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.isSandbox 
            ? "Gateway ping verified! Operating in high-fidelity sandbox simulator mode." 
            : `Live Razorpay Gateway Connected! Order ID: ${data.orderId}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gateway returned an error response.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to reach Razorpay backend endpoints.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustName || !newCustEmail) return;
    try {
      const res = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustName,
          email: newCustEmail,
          company: newCustCompany,
          tier: newCustTier,
          notes: newCustNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddCustomerModal(false);
        setNewCustName("");
        setNewCustEmail("");
        setNewCustCompany("");
        setNewCustNotes("");
        fetchData();
        setActionFeedback("Customer added to CRM!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invClientName || !invClientEmail) return;
    try {
      const res = await fetch("/api/crm/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: invClientName,
          clientEmail: invClientEmail,
          clientCompany: invClientCompany,
          currency: invCurrency,
          taxRate: Number(invTaxRate) || 0,
          items: [{ description: invItemDesc, qty: 1, rate: Number(invItemRate), amount: Number(invItemRate) }],
          notes: invNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewInvoiceModal(false);
        fetchData();
        setActionFeedback(`Invoice ${data.invoice.id} created successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleInvoiceStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await fetch("/api/crm/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, paymentMethod: nextStatus === "Paid" ? "Razorpay Gateway" : "Pending" }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* GOD-LEVEL MASTER HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-[#0a121e] via-[#070d17] to-[#0c1626] p-6 md:p-8 rounded-3xl border border-blue-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Enterprise Financial & CRM Suite
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {keyId ? "Live Razorpay Engine Active" : "Sandbox Simulator Active"}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Multi-Currency Engine (₹ INR & $ USD)
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Financial Cockpit, CRM & Revenue Radar
          </h2>
          
          <p className="text-gray-400 text-xs md:text-sm max-w-3xl leading-relaxed">
            Universal end-to-end commercial operations: Customer LTV tracking, Razorpay checkout gateway (UPI, Cards, NetBanking), automated billing & tax invoicing, click attribution radar, and real-time revenue collection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setTestCheckoutProduct({
              id: "test-product-01",
              title: "AI Quantitative Trading Bot Kit",
              price: 49,
              priceInr: 3999,
              category: "Trading Bots & Scripts",
              description: "Live interactive test checkout session with Razorpay gateway modal.",
              deliverable: "Instant Access Key + Source Code Repository"
            })}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 font-mono hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-blue-200" /> Test Checkout Modal
          </button>

          <button
            onClick={fetchData}
            className="p-3 bg-[#0c1422] hover:bg-gray-800 text-gray-300 rounded-2xl border border-gray-800/80 transition-all shadow-md"
            title="Refresh All Intelligence"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* EXECUTIVE TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total ARR / Run-Rate */}
        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Gross Run-Rate</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white font-mono">
            ${analyticsData ? analyticsData.grandTotalUsd.toLocaleString() : "14,970"}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +34.2% MoM Expansion
          </p>
        </div>

        {/* Multi-Currency Collections (USD + INR) */}
        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Cash Collected</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-black text-white font-mono">${stats.totalUSD.toLocaleString()}</span>
            <span className="text-xs font-mono text-gray-400 font-bold">+</span>
            <span className="text-lg md:text-xl font-black text-emerald-400 font-mono">₹{stats.totalINR.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cleared via Razorpay
          </p>
        </div>

        {/* Customer LTV & VIPs */}
        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Customer LTV / VIPs</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white font-mono">
            {customers.length} Accounts
          </p>
          <p className="text-[11px] text-purple-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <Award className="w-3.5 h-3.5" /> ${analyticsData ? analyticsData.blendedArpu : 890} Blended ARPU
          </p>
        </div>

        {/* Click & Conversion Performance */}
        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Click-Through & EPC</span>
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white font-mono">
            {analyticsData ? `${analyticsData.overallCtr}% CTR` : "4.51% CTR"}
          </p>
          <p className="text-[11px] text-cyan-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <Activity className="w-3.5 h-3.5" /> {analyticsData ? `${analyticsData.totalConversions} Conversions` : "492 Conversions"}
          </p>
        </div>

      </div>

      {/* GOD-LEVEL TAB NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2 bg-[#060910] p-1.5 rounded-2xl border border-gray-800/80 shadow-inner">
          
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "cockpit" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Executive Cockpit
          </button>

          <button
            onClick={() => setActiveTab("crm")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "crm" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customer 360° CRM ({customers.length})
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "invoices" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Invoices & Billing ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab("clicks")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "clicks" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Click Attribution Radar
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "ledger" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Orders Ledger ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono ${
              activeTab === "credentials" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-850"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Gateway & Webhooks
          </button>

        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="text-xs font-mono px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {actionFeedback}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE FINANCIAL COCKPIT */}
      {/* ========================================================================= */}
      {activeTab === "cockpit" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Revenue Stream Breakdown & Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stream Distribution */}
            <div className="lg:col-span-2 bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-400" /> Multi-Stream Revenue Diversification
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">5 distinct non-correlated income channels operating in sync.</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  $0 Platform Fee
                </span>
              </div>

              <div className="space-y-4">
                {(analyticsData?.streams || [
                  { name: "Direct Sponsor Packages", revenue: 5800, percentage: 38, color: "bg-blue-500" },
                  { name: "Programmatic Ads (AdSense)", revenue: 3450, percentage: 24, color: "bg-green-500" },
                  { name: "High-Ticket Affiliates", revenue: 2840, percentage: 19, color: "bg-amber-500" },
                  { name: "Digital Products & Code Kits", revenue: 1850, percentage: 12, color: "bg-purple-500" },
                  { name: "VIP Newsletter Memberships", revenue: 1030, percentage: 7, color: "bg-pink-500" },
                ]).map((stream: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-gray-200 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stream.color}`}></span>
                        {stream.name}
                      </span>
                      <span className="font-black text-white">${stream.revenue.toLocaleString()} ({stream.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#060910] h-2 rounded-full overflow-hidden border border-gray-850">
                      <div className={`h-full ${stream.color} rounded-full`} style={{ width: `${stream.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-center font-mono">
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850">
                  <span className="text-[10px] text-gray-400 uppercase">Estimated MRR</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">${analyticsData ? analyticsData.mrrUsd : 6280}</p>
                </div>
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850">
                  <span className="text-[10px] text-gray-400 uppercase">Cash Collection Speed</span>
                  <p className="text-base font-bold text-blue-400 mt-0.5">&lt; 2.4 hrs</p>
                </div>
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850">
                  <span className="text-[10px] text-gray-400 uppercase">Refund Rate</span>
                  <p className="text-base font-bold text-purple-400 mt-0.5">0.00%</p>
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Empire Conversion Funnel
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Impression to captured revenue pipeline.</p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                <div className="p-3.5 bg-[#060910] rounded-2xl border border-gray-800 space-y-1">
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>1. Global Impressions</span>
                    <span className="text-white font-bold">284.5K</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[100%]"></div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#060910] rounded-2xl border border-gray-800 space-y-1">
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>2. Engaged Clicks</span>
                    <span className="text-cyan-400 font-bold">12,840 (4.51%)</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full w-[65%]"></div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#060910] rounded-2xl border border-gray-800 space-y-1">
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>3. Checkout Modal Triggers</span>
                    <span className="text-purple-400 font-bold">1,820 (14.1%)</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[40%]"></div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 space-y-1">
                  <div className="flex justify-between text-emerald-300 text-[11px] font-bold">
                    <span>4. Verified Paid Conversions</span>
                    <span className="text-emerald-400 font-bold">492 (27.0%)</span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[27%]"></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Quick Actions & Recent Cash Inflow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Rapid Commercial Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowNewInvoiceModal(true)}
                  className="p-4 bg-[#060910] hover:bg-gray-850 rounded-2xl border border-gray-800 text-left transition-all group"
                >
                  <FileText className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-white text-xs">Create Tax Invoice</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Direct sponsor billing with 1-click Razorpay link</div>
                </button>

                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-4 bg-[#060910] hover:bg-gray-850 rounded-2xl border border-gray-800 text-left transition-all group"
                >
                  <Users className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-white text-xs">Add CRM Client</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Register high-value advertiser or VIP buyer</div>
                </button>
              </div>
            </div>

            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Recent Cash Inflow
                </h3>
                <button onClick={() => setActiveTab("ledger")} className="text-[11px] text-blue-400 hover:underline font-mono">
                  View All Orders →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {transactions.slice(0, 3).map((txn) => (
                  <div key={txn.id} className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{txn.customerName || "Customer"}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{txn.itemTitle}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-400">
                        {txn.currency === "INR" ? `₹${txn.amount.toLocaleString("en-IN")}` : `$${txn.amount}`}
                      </div>
                      <div className="text-[10px] text-gray-500">{txn.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER 360° CRM */}
      {/* ========================================================================= */}
      {activeTab === "crm" && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            
            <div className="flex items-center gap-2 bg-[#090e17] px-3.5 py-2.5 rounded-2xl border border-gray-800 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search CRM by name, company, email, or VIP tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-200 placeholder-gray-500 outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#060910] p-1 rounded-xl border border-gray-800">
                {["all", "VIP Whale", "Enterprise Sponsor", "Pro Subscriber", "Warm Lead"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCrmTierFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      crmTierFilter === t ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Customer
              </button>
            </div>

          </div>

          {/* CRM Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 hover:border-blue-500/50 transition-all shadow-xl cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={cust.avatar} alt={cust.name} className="w-12 h-12 rounded-2xl object-cover border border-gray-750" />
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{cust.name}</h4>
                      <p className="text-xs text-gray-400">{cust.company}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    cust.tier.includes("Whale") || cust.tier.includes("Enterprise")
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  }`}>
                    {cust.tier}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Lifetime Value (LTV):</span>
                    <span className="font-bold text-emerald-400">
                      {cust.totalSpentUsd > 0 ? `$${cust.totalSpentUsd.toLocaleString()}` : `₹${cust.totalSpentInr.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Completed Orders:</span>
                    <span className="font-bold text-white">{cust.ordersCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Country / Location:</span>
                    <span className="text-gray-300">{cust.country}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(cust.tags || []).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#060910] border border-gray-800 text-[10px] text-gray-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-850 flex justify-between items-center text-[11px] text-gray-500 font-mono">
                  <span>Assigned: {cust.assignedRep || "Nexus Desk"}</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVOICES, BILLING & COLLECTIONS */}
      {/* ========================================================================= */}
      {activeTab === "invoices" && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Commercial Invoicing & GST/Tax Collections
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Automated tax invoices with Razorpay payment link integration.</p>
            </div>

            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Create New Invoice
            </button>
          </div>

          {/* Invoices Table */}
          <div className="bg-[#090e17] rounded-3xl border border-gray-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#060910] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-4">Invoice ID</th>
                    <th className="px-5 py-4">Client / Company</th>
                    <th className="px-5 py-4">Issue & Due Date</th>
                    <th className="px-5 py-4">Total Amount</th>
                    <th className="px-5 py-4">Payment Channel</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-900/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white">{inv.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{inv.clientName}</div>
                        <div className="text-[11px] text-gray-400">{inv.clientCompany} • {inv.clientEmail}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-gray-400">
                        <div>Issued: {inv.issueDate}</div>
                        <div className="text-gray-500">Due: {inv.dueDate}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        {inv.currency === "INR" ? `₹${inv.total.toLocaleString("en-IN")}` : `$${inv.total.toLocaleString()}`}
                        {inv.taxAmount > 0 && <span className="text-[10px] text-gray-500 block font-normal">(Incl. {inv.taxRate}% GST)</span>}
                      </td>
                      <td className="px-5 py-4 text-[11px] text-gray-300 font-mono">
                        {inv.paymentMethod}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleInvoiceStatus(inv.id, inv.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                            inv.status === "Paid"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${inv.status === "Paid" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}></span>
                          {inv.status}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setActiveInvoicePreview(inv)}
                          className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono transition-colors"
                        >
                          Preview / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLICK ATTRIBUTION RADAR */}
      {/* ========================================================================= */}
      {activeTab === "clicks" && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Traffic Sources Breakdown */}
            <div className="lg:col-span-2 bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" /> Channel Acquisition & Revenue Attribution
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#060910] text-gray-400 text-[10px] uppercase border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Channel Source</th>
                      <th className="px-4 py-3">Visitors</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">CTR</th>
                      <th className="px-4 py-3">Conversions</th>
                      <th className="px-4 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850 text-gray-300">
                    {(analyticsData?.sources || []).map((src: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-bold text-white">{src.source}</td>
                        <td className="px-4 py-3">{src.visitors.toLocaleString()}</td>
                        <td className="px-4 py-3 text-cyan-400">{src.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3">{src.ctr}%</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">{src.conversions}</td>
                        <td className="px-4 py-3 font-bold text-white">${src.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Geographic Heatmap */}
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Geographic RPM Distribution
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                {(analyticsData?.geoDistribution || []).map((geo: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#060910] rounded-xl border border-gray-850 space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span className="font-bold text-white">{geo.country} ({geo.code})</span>
                      <span className="text-emerald-400 font-bold">${geo.rpmUsd} RPM</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>{geo.percentage}% Traffic Share</span>
                      <span>{geo.conversions} Conversions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Real-Time Live Click Stream */}
          <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Real-Time Live Click Stream Telemetry
            </h3>

            <div className="space-y-2">
              {(analyticsData?.recentClickStream || []).map((clk: any) => (
                <div key={clk.id} className="p-3.5 bg-[#060910] rounded-xl border border-gray-850 flex flex-wrap justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="font-bold text-white">{clk.target}</span>
                    <span className="text-gray-500">via {clk.source}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">{clk.niche}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-gray-500">{clk.time}</span>
                    <span className={`font-bold ${clk.converted ? "text-emerald-400" : "text-gray-500"}`}>
                      {clk.converted ? `Converted (+${clk.payout})` : "Engaged"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ORDERS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "ledger" && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-[#090e17] px-3.5 py-2 rounded-2xl border border-gray-800 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search orders by customer, email, payment ID or access key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                className="bg-transparent text-xs text-gray-200 placeholder-gray-500 outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {["all", "digital_product", "sponsor_slot", "vip_newsletter", "custom_invoice"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold capitalize transition-all whitespace-nowrap ${
                    filterType === t 
                      ? "bg-gray-800 text-white border border-gray-700" 
                      : "text-gray-400 hover:bg-gray-900 border border-transparent"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#090e17] rounded-3xl border border-gray-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#060910] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-4">Customer / Item</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Payment & Order ID</th>
                    <th className="px-5 py-4">Access Key Granted</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-xs">{txn.customerName || "Customer"}</div>
                        <div className="text-[11px] text-gray-400">{txn.customerEmail || "No email"}</div>
                        <div className="text-[10px] font-mono text-blue-400 mt-0.5">{txn.itemTitle}</div>
                      </td>
                      <td className="px-5 py-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] uppercase font-bold">
                          {txn.itemType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        {txn.currency === "INR" ? `₹${txn.amount.toLocaleString("en-IN")}` : `$${txn.amount}`}
                      </td>
                      <td className="px-5 py-4 text-[11px] text-gray-300 font-mono">
                        {txn.paymentMethod || "Razorpay Gateway"}
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-gray-400">
                        <div className="text-gray-300">{txn.paymentId}</div>
                        <div className="text-gray-500">{txn.orderId}</div>
                      </td>
                      <td className="px-5 py-4">
                        {txn.accessKey ? (
                          <button
                            onClick={() => copyToClipboard(txn.accessKey!, txn.id)}
                            className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-mono text-[11px] hover:bg-blue-900/60 transition-all flex items-center gap-1.5"
                          >
                            {copiedId === txn.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{txn.accessKey}</span>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Captured
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GATEWAY KEYS & WEBHOOKS */}
      {/* ========================================================================= */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" /> Razorpay Production & Sandbox API Credentials
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage live API credentials or test in sandbox mode with zero fees.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">
                    Razorpay Key ID (`RAZORPAY_KEY_ID` & `NEXT_PUBLIC_RAZORPAY_KEY_ID`)
                  </label>
                  <input
                    type="text"
                    placeholder="rzp_live_xxxxxxxxxxxxxxxx or rzp_test_xxxxxxxxxxxxxxxx"
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-mono font-bold text-gray-300">
                      Razorpay Key Secret (`RAZORPAY_KEY_SECRET`)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-gray-400 hover:text-gray-200 flex items-center gap-1"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecret ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="your_razorpay_secret_key"
                    value={keySecret}
                    onChange={(e) => setKeySecret(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">
                    Webhook Secret (`RAZORPAY_WEBHOOK_SECRET`)
                  </label>
                  <input
                    type="text"
                    placeholder="your_custom_webhook_secret_phrase"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-800/80">
                <button
                  onClick={handleSaveCredentials}
                  disabled={isSavingCreds}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 font-mono disabled:opacity-50"
                >
                  {isSavingCreds ? "Saving..." : "Save Credentials"}
                </button>

                <button
                  onClick={handleTestGateway}
                  disabled={isTesting}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-750 text-gray-200 font-bold text-xs rounded-xl border border-gray-700 transition-all font-mono flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-blue-400" : ""}`} />
                  Test Gateway Connection
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                  testResult.success 
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                    : "bg-red-500/10 text-red-300 border-red-500/30"
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Webhooks Stream */}
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Webhook Events Stream ({webhookLogs.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {webhookLogs.map((wh) => (
                  <div key={wh.id} className="p-3 bg-[#060910] rounded-xl border border-gray-850 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-blue-300 font-bold">
                      <span>{wh.event}</span>
                      <span className="text-gray-500">{new Date(wh.receivedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#090e17] p-6 rounded-3xl border border-gray-800/80 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Supported Payment Channels
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">UPI & QR Intent</div>
                    <div className="text-[11px] text-gray-400">Google Pay, PhonePe, Paytm, BHIM, QR code</div>
                  </div>
                </div>
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Credit & Debit Cards</div>
                    <div className="text-[11px] text-gray-400">Visa, Mastercard, RuPay, Amex, Diners Club</div>
                  </div>
                </div>
                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex items-center gap-3">
                  <Landmark className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">NetBanking (50+ Banks)</div>
                    <div className="text-[11px] text-gray-400">HDFC, ICICI, SBI, Axis, Kotak, IndusInd</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CUSTOMER PROFILE SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end">
          <div className="bg-[#090e17] w-full max-w-xl h-full border-l border-gray-800 p-6 md:p-8 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300 shadow-2xl">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-14 h-14 rounded-2xl object-cover border border-gray-700" />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-400">{selectedCustomer.company} • {selectedCustomer.country}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-[#060910] rounded-2xl border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase">Total Lifetime Spend</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {selectedCustomer.totalSpentUsd > 0 ? `$${selectedCustomer.totalSpentUsd.toLocaleString()}` : `₹${selectedCustomer.totalSpentInr.toLocaleString("en-IN")}`}
                </p>
              </div>
              <div className="p-3.5 bg-[#060910] rounded-2xl border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase">Tier & Status</span>
                <p className="text-sm font-bold text-purple-400 mt-1">{selectedCustomer.tier}</p>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300">Executive Account Notes</label>
              <div className="p-4 bg-[#060910] rounded-2xl border border-gray-800 text-xs text-gray-300">
                {selectedCustomer.notes || "No internal notes recorded yet."}
              </div>
            </div>

            {/* Past Deals & Transactions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Transaction History</h4>
              {(selectedCustomer.deals || []).map((deal: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex justify-between items-center text-xs font-mono">
                  <div>
                    <div className="font-bold text-white">{deal.title}</div>
                    <div className="text-[10px] text-gray-500">{deal.date}</div>
                  </div>
                  <div className="font-bold text-emerald-400">
                    {deal.currency === "INR" ? `₹${deal.amount.toLocaleString("en-IN")}` : `$${deal.amount}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 flex gap-3">
              <a
                href={`mailto:${selectedCustomer.email}`}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl font-mono text-center transition-all"
              >
                Send Direct Email
              </a>
              <button
                onClick={() => {
                  setInvClientName(selectedCustomer.name);
                  setInvClientEmail(selectedCustomer.email);
                  setInvClientCompany(selectedCustomer.company);
                  setSelectedCustomer(null);
                  setShowNewInvoiceModal(true);
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl font-mono transition-all"
              >
                Issue Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD CUSTOMER MODAL */}
      {/* ========================================================================= */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#090e17] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Add Customer to CRM
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Satoshi Nakamoto"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. client@company.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Binance Labs"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Customer Tier</label>
                <select
                  value={newCustTier}
                  onChange={(e) => setNewCustTier(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
                >
                  <option value="VIP Whale">VIP Whale ($5,000+)</option>
                  <option value="Enterprise Sponsor">Enterprise Sponsor ($1,000 - $5,000)</option>
                  <option value="Pro Subscriber">Pro Subscriber ($100 - $1,000)</option>
                  <option value="Warm Lead">Warm Lead / Negotiating</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Deals discussed, sponsorship preferences, responsiveness..."
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
                ></textarea>
              </div>

              <button
                onClick={handleCreateCustomer}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl font-mono transition-all shadow-lg shadow-blue-600/20"
              >
                Register in CRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE INVOICE MODAL */}
      {/* ========================================================================= */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#090e17] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Create Commercial Invoice
              </h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">Client Name</label>
                  <input
                    type="text"
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">Client Email</label>
                  <input
                    type="email"
                    value={invClientEmail}
                    onChange={(e) => setInvClientEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Line Item Description</label>
                <input
                  type="text"
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">Rate / Price</label>
                  <input
                    type="number"
                    value={invItemRate}
                    onChange={(e) => setInvItemRate(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">Currency</label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">GST/Tax %</label>
                  <input
                    type="number"
                    value={invTaxRate}
                    onChange={(e) => setInvTaxRate(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateInvoice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl font-mono transition-all shadow-lg shadow-blue-600/20"
              >
                Generate & Dispatch Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINTABLE INVOICE PREVIEW */}
      {/* ========================================================================= */}
      {activeInvoicePreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white text-gray-900 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl font-sans">
            
            <div className="flex justify-between items-start border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-950">TAX INVOICE</h2>
                <p className="text-xs font-mono text-gray-500 mt-1">Invoice #{activeInvoicePreview.id}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-blue-600">NEXUS MEDIA NETWORK</h3>
                <p className="text-xs text-gray-500">Autonomous Digital Publishing Inc.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-500 block uppercase">Billed To:</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{activeInvoicePreview.clientName}</p>
                <p className="text-gray-600">{activeInvoicePreview.clientCompany}</p>
                <p className="text-gray-600">{activeInvoicePreview.clientEmail}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-500 block uppercase">Invoice Details:</span>
                <p className="text-gray-600 mt-0.5">Issue Date: {activeInvoicePreview.issueDate}</p>
                <p className="text-gray-600">Due Date: {activeInvoicePreview.dueDate}</p>
                <p className="font-bold text-emerald-600 font-mono mt-1">Status: {activeInvoicePreview.status}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  {activeInvoicePreview.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-3 font-sans font-medium">{it.description}</td>
                      <td className="p-3 text-right font-bold">
                        {activeInvoicePreview.currency === "INR" ? `₹${it.amount.toLocaleString("en-IN")}` : `$${it.amount.toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end text-right font-mono text-xs space-y-1">
              <div>
                <div className="text-gray-600">Subtotal: {activeInvoicePreview.currency === "INR" ? `₹${activeInvoicePreview.subtotal.toLocaleString("en-IN")}` : `$${activeInvoicePreview.subtotal.toLocaleString()}`}</div>
                {activeInvoicePreview.taxAmount > 0 && (
                  <div className="text-gray-600">GST ({activeInvoicePreview.taxRate}%): {activeInvoicePreview.currency === "INR" ? `₹${activeInvoicePreview.taxAmount.toLocaleString("en-IN")}` : `$${activeInvoicePreview.taxAmount.toLocaleString()}`}</div>
                )}
                <div className="text-base font-black text-gray-950 pt-2 border-t border-gray-300">
                  Total Due: {activeInvoicePreview.currency === "INR" ? `₹${activeInvoicePreview.total.toLocaleString("en-IN")}` : `$${activeInvoicePreview.total.toLocaleString()}`}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200">
              <span className="font-bold text-gray-700">Payment Terms:</span> {activeInvoicePreview.notes}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActiveInvoicePreview(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Test Checkout Modal Portal */}
      {testCheckoutProduct && (
        <InstantProductCheckoutModal
          product={{
            id: testCheckoutProduct.id,
            name: testCheckoutProduct.title,
            slug: "test-bot-kit",
            niche: "crypto",
            priceUsd: testCheckoutProduct.price,
            format: "ZIP + GitHub Access",
            description: testCheckoutProduct.description,
            features: ["Source Code Repo", "Real-Time Signal Engine", "Lifetime Updates"],
            salesCount: 142
          }}
          onClose={() => {
            setTestCheckoutProduct(null);
            fetchData();
          }}
        />
      )}

    </div>
  );
}
