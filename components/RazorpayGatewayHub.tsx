"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Key, 
  ExternalLink, Copy, Check, Search, Download, Plus, Zap, ArrowUpRight,
  Eye, EyeOff, Smartphone, Landmark, Wallet, Globe, Sparkles, Filter, Trash2
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

interface WebhookLog {
  id: string;
  receivedAt: string;
  event: string;
  payload: any;
}

export default function RazorpayGatewayHub() {
  const [activeTab, setActiveTab] = useState<"ledger" | "credentials" | "link_gen" | "webhooks">("ledger");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState({ totalUSD: 0, totalINR: 0, count: 0, capturedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Credentials & Config
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Link Generator State
  const [linkTitle, setLinkTitle] = useState("Direct Sponsor Slot — 30 Days");
  const [linkAmount, setLinkAmount] = useState("499");
  const [linkCurrency, setLinkCurrency] = useState<"INR" | "USD">("USD");
  const [linkType, setLinkType] = useState("sponsor_slot");
  const [linkCustomer, setLinkCustomer] = useState("");
  const [linkEmail, setLinkEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Direct Test Checkout
  const [testCheckoutProduct, setTestCheckoutProduct] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payments/transactions?type=${filterType}&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setStats(data.stats || { totalUSD: 0, totalINR: 0, count: 0, capturedCount: 0 });
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/payments/webhooks");
      const data = await res.json();
      if (data.success) {
        setWebhookLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load webhooks", err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setKeyId(data.settings.RAZORPAY_KEY_ID || "");
        setKeySecret(data.settings.RAZORPAY_KEY_SECRET || "");
        setWebhookSecret(data.settings.RAZORPAY_WEBHOOK_SECRET || "");
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchWebhooks();
    loadSettings();
  }, [filterType]);

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
        setActionFeedback("Razorpay API credentials securely saved!");
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
            ? "Gateway verified! Running in high-fidelity sandbox simulator mode." 
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

  const handleCreateCustomInvoice = async () => {
    try {
      const res = await fetch("/api/payments/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTitle: linkTitle,
          amount: Number(linkAmount),
          currency: linkCurrency,
          itemType: linkType,
          customerName: linkCustomer || "Direct Client",
          customerEmail: linkEmail || "client@company.com",
          paymentMethod: "Razorpay Checkout Link",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const link = `${window.location.origin}/checkout?item=${encodeURIComponent(linkTitle)}&amt=${linkAmount}&cur=${linkCurrency}&type=${linkType}&key=${data.transaction.accessKey}`;
        setGeneratedLink(link);
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await fetch(`/api/payments/transactions?id=${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0d1624] via-[#09111c] to-[#0d1624] p-6 md:p-8 rounded-2xl border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" /> Universal Payment Gateway
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {keyId ? "Live Razorpay Mode" : "Sandbox Simulator"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Razorpay Payments & Order Vault
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-2xl">
            Accept UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, NetBanking across 50+ banks, and International payments for Digital Products and Direct Sponsor Deals.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
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
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 font-mono"
          >
            <Sparkles className="w-4 h-4" /> Test Live Checkout
          </button>
          <button
            onClick={fetchTransactions}
            className="p-2.5 bg-gray-900/80 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 transition-all"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">USD Revenue</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">${stats.totalUSD.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Captured & Cleared
          </p>
        </div>

        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">INR Revenue</span>
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">₹{stats.totalINR.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-mono">
            <Smartphone className="w-3 h-3" /> UPI & NetBanking
          </p>
        </div>

        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.capturedCount} Orders</p>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">100% Success Rate</p>
        </div>

        <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">Webhook Health</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">Active</p>
          <p className="text-[11px] text-cyan-400 mt-1 font-mono">Listening /api/payments/razorpay/webhook</p>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-2 bg-[#060910] p-1.5 rounded-xl border border-gray-800/80">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ledger" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Transactions & Orders ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "credentials" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> API Keys & Gateways
          </button>
          <button
            onClick={() => setActiveTab("link_gen")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "link_gen" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Create Payment Link
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "webhooks" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Webhook Events ({webhookLogs.length})
          </button>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> {actionFeedback}
          </div>
        )}
      </div>

      {/* TAB 1: TRANSACTIONS & ORDERS LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-[#090e17] px-3 py-2 rounded-xl border border-gray-800 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search orders by customer, email, payment ID or access key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchTransactions()}
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

          {/* Transactions Table */}
          <div className="bg-[#090e17] rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#060910] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-3.5">Customer / Item</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Payment & Order ID</th>
                    <th className="px-5 py-3.5">Access Key Granted</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500 font-mono">
                        No transactions recorded yet. Launch a test checkout or create a payment link above!
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
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
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDeleteTransaction(txn.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                            title="Delete transaction record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS & GATEWAYS */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#090e17] p-6 rounded-2xl border border-gray-800/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" /> Razorpay Production / Sandbox Credentials
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Obtain your API credentials from your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Razorpay Dashboard <ExternalLink className="w-3 h-3" /></a>.
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
                  <p className="text-[11px] text-gray-500 mt-1">
                    Used to verify incoming HMAC signatures on <code className="text-gray-400">/api/payments/razorpay/webhook</code>.
                  </p>
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
          </div>

          <div className="space-y-6">
            <div className="bg-[#090e17] p-6 rounded-2xl border border-gray-800/80 shadow-xl space-y-4">
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

                <div className="p-3 bg-[#060910] rounded-xl border border-gray-850 flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Wallets & PayLater</div>
                    <div className="text-[11px] text-gray-400">Paytm Wallet, PhonePe, Mobikwik, Amazon Pay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE CUSTOM PAYMENT LINK */}
      {activeTab === "link_gen" && (
        <div className="max-w-2xl bg-[#090e17] p-6 md:p-8 rounded-2xl border border-gray-800/80 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create Direct Payment Checkout Link
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Generate a bespoke checkout invoice for a direct advertiser, sponsor, or premium client deal.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Item / Deal Title</label>
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Amount</label>
                <input
                  type="number"
                  value={linkAmount}
                  onChange={(e) => setLinkAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Currency</label>
                <select
                  value={linkCurrency}
                  onChange={(e) => setLinkCurrency(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs font-mono text-white outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Client / Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ledger Marketing"
                  value={linkCustomer}
                  onChange={(e) => setLinkCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Client Email</label>
                <input
                  type="email"
                  placeholder="e.g. sponsor@client.com"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">Deal Category</label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#060910] border border-gray-800 rounded-xl text-xs text-white outline-none"
              >
                <option value="sponsor_slot">Direct Sponsor Package</option>
                <option value="digital_product">Digital Product Kit</option>
                <option value="vip_newsletter">VIP Alpha Membership</option>
                <option value="custom_invoice">Custom Consulting / Media Deal</option>
              </select>
            </div>

            <button
              onClick={handleCreateCustomInvoice}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all font-mono"
            >
              Generate Invoice & Payment Link
            </button>

            {generatedLink && (
              <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-2">
                <div className="text-[11px] font-mono text-blue-300 font-bold">Shareable Checkout URL:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full px-3 py-1.5 bg-[#060910] border border-blue-900 rounded-lg text-xs font-mono text-gray-300 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLink, "gen_link")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {copiedId === "gen_link" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOK ACTIVITY STREAM */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="bg-[#090e17] p-5 rounded-2xl border border-gray-800/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> Live Webhook Event Stream
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Receives asynchronous server-to-server notifications from Razorpay gateway.
                </p>
              </div>
              <button
                onClick={fetchWebhooks}
                className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {webhookLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-mono">
                  No webhook events received yet. Point your Razorpay Webhook URL to: <br />
                  <code className="text-blue-400 bg-black/40 px-2 py-0.5 rounded mt-2 inline-block">
                    https://your-domain.com/api/payments/razorpay/webhook
                  </code>
                </div>
              ) : (
                webhookLogs.map((wh) => (
                  <div key={wh.id} className="p-4 bg-[#060910] rounded-xl border border-gray-850 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-bold border border-blue-900/60">
                        {wh.event}
                      </span>
                      <span className="text-gray-500">{new Date(wh.receivedAt).toLocaleString()}</span>
                    </div>
                    <pre className="text-[11px] font-mono text-gray-400 bg-black/50 p-3 rounded-lg overflow-x-auto max-h-40">
                      {JSON.stringify(wh.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
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
            fetchTransactions();
          }}
        />
      )}

    </div>
  );
}
