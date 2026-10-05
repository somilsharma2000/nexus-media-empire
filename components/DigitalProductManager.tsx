"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  DollarSign, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Tag, 
  Eye, 
  Layers, 
  TrendingUp,
  X,
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import InstantProductCheckoutModal from "./InstantProductCheckoutModal";
import { formatNumber } from "@/lib/format";

interface DigitalProduct {
  id: string;
  name: string;
  niche: string;
  price: number;
  format: string;
  description: string;
  targetKeywords: string[];
  salesCount: number;
  revenue: number;
  downloadUrl: string;
  ctaText: string;
  isActive: boolean;
}

export default function DigitalProductManager() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<DigitalProduct | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<any | null>(null);


  // Form State
  const [formData, setFormData] = useState<Partial<DigitalProduct>>({
    name: "",
    niche: "crypto",
    price: 29,
    format: "PDF + Spreadsheet",
    description: "",
    targetKeywords: [],
    ctaText: "Download Now",
    downloadUrl: "#",
    isActive: true
  });
  const [keywordInput, setKeywordInput] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0 && !previewProduct) {
          setPreviewProduct(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (product: DigitalProduct) => {
    const updated = { ...product, isActive: !product.isActive };
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? updated : p));
        showToast(`${product.name} ${updated.isActive ? "activated" : "paused"}`);
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedProduct ? "PUT" : "POST";
    const body = selectedProduct ? { ...formData, id: selectedProduct.id } : formData;

    try {
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showToast(selectedProduct ? "Product updated successfully!" : "New product created!");
        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch {
      showToast("Error saving product", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this digital product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast("Product deleted");
        if (previewProduct?.id === id) {
          setPreviewProduct(products.find(p => p.id !== id) || null);
        }
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const openEditModal = (product: DigitalProduct) => {
    setSelectedProduct(product);
    setFormData(product);
    setKeywordInput(product.targetKeywords.join(", "));
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      niche: "crypto",
      price: 29,
      format: "PDF + Spreadsheet",
      description: "",
      targetKeywords: [],
      ctaText: "Download Now",
      downloadUrl: "#",
      isActive: true
    });
    setKeywordInput("");
    setIsModalOpen(true);
  };

  const totalRevenue = products.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalSales = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);

  const filteredProducts = products.filter(p => {
    if (activeFilter === "all") return true;
    return p.niche === activeFilter;
  });

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-semibold shadow-2xl flex items-center gap-2 ${
          toast.type === "success" 
            ? "bg-emerald-950 border-emerald-700 text-emerald-300" 
            : "bg-red-950 border-red-700 text-red-300"
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase">Digital Product Gross</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">${formatNumber(totalRevenue)}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> 100% Net Profit Margin ($0 COGS)
          </p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase">Total Digital Downloads</span>
            <Download className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{formatNumber(totalSales)}</p>
          <p className="text-xs text-gray-400 mt-1 font-mono">Instant PDF & Sheet Access</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase">Active Product Funnels</span>
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{products.filter(p => p.isActive).length} / {products.length}</p>
          <p className="text-xs text-purple-400 mt-1 font-mono">Intent-matched across all articles</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-bold uppercase">Funnel Controls</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <button 
            onClick={openCreateModal}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Digital Product
          </button>
        </div>
      </div>

      {/* Main Catalog & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Products Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {["all", "crypto", "finance", "news", "saas", "gym"].map(niche => (
                <button
                  key={niche}
                  onClick={() => setActiveFilter(niche)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeFilter === niche 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50" 
                      : "bg-gray-900/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
                  }`}
                >
                  {niche === "all" ? "All Niches" : niche}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-mono">{filteredProducts.length} Products</span>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800/60">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm font-mono">Loading product funnel data...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No products found in this category.</div>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setPreviewProduct(product)}
                  className={`p-5 flex items-center justify-between hover:bg-gray-800/40 transition-all cursor-pointer ${
                    previewProduct?.id === product.id ? "bg-emerald-950/20 border-l-4 border-l-emerald-500" : ""
                  }`}
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">
                        {product.niche}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        ${product.price}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ({product.format})
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base leading-snug">{product.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {product.targetKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-gray-400 border border-gray-800 font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <p className="text-sm font-bold text-white">{product.salesCount} sales</p>
                      <p className="text-xs text-emerald-400">${formatNumber(product.revenue)}</p>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(product); }}
                      className={`w-12 h-6 rounded-full transition-all relative p-1 ${
                        product.isActive ? "bg-emerald-600 shadow-md shadow-emerald-900/50" : "bg-gray-800"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                        product.isActive ? "translate-x-6" : "translate-x-0"
                      }`} />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                      className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Article Injection Card Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" /> Reader Callout Preview
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              Live In-Article Injection
            </span>
          </div>

          {previewProduct ? (
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden shadow-2xl space-y-4">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-lg">
                Exclusive Resource
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Package className="w-4 h-4" /> {previewProduct.format}
              </div>

              <h4 className="text-xl font-black text-white leading-snug">
                {previewProduct.name}
              </h4>

              <p className="text-sm text-gray-300 leading-relaxed">
                {previewProduct.description}
              </p>

              <div className="bg-black/60 border border-gray-800 p-3 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Instant Access Delivery:</span>
                  <span className="text-white font-mono font-bold">100% Digital Download</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Target Intent Match:</span>
                  <span className="text-emerald-400 font-mono font-bold">{previewProduct.niche.toUpperCase()} Articles</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 line-through mr-2 font-mono">${previewProduct.price * 2}</span>
                  <span className="text-2xl font-black text-white font-mono">${previewProduct.price}</span>
                </div>
                <button 
                  onClick={() => setCheckoutProduct({ 
                    id: previewProduct.id, 
                    name: previewProduct.name, 
                    slug: previewProduct.id, 
                    niche: previewProduct.niche, 
                    priceUsd: previewProduct.price, 
                    format: previewProduct.format, 
                    description: previewProduct.description, 
                    features: ["Instant High-Res PDF Access", "Spreadsheet Model / Notion Template", "Lifetime Commercial License"], 
                    salesCount: previewProduct.salesCount 
                  })}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wide"
                >
                  <Download className="w-4 h-4" /> {previewProduct.ctaText}
                </button>

              </div>

              <div className="text-[10px] text-gray-500 text-center font-mono pt-1">
                🔒 30-Day Money Back Guarantee • Encrypted Checkout
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-900/30 border border-gray-800 rounded-2xl text-center text-gray-500 text-xs">
              Select a product to view the in-article card layout.
            </div>
          )}

          <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl text-xs text-gray-400 space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Intent Match Engine
            </p>
            <p className="text-[11px] leading-relaxed">
              When an article contains any of the target keywords (e.g. <code>staking</code>, <code>tax</code>, <code>churn</code>), our rendering engine dynamically embeds this high-converting card at the 40% scroll mark.
            </p>
          </div>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {selectedProduct ? "Edit Digital Product" : "Create Digital Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={formData.name || ""} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. 2026 Crypto Staking & Tax Optimization Blueprint"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Niche Category</label>
                  <select 
                    value={formData.niche || "crypto"} 
                    onChange={e => setFormData({ ...formData, niche: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none uppercase"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="finance">Finance</option>
                    <option value="news">Tech & AI</option>
                    <option value="saas">SaaS</option>
                    <option value="gym">Gym-OS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Price ($USD)</label>
                  <input 
                    type="number" 
                    value={formData.price || 29} 
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="1"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Product Format</label>
                  <input 
                    type="text" 
                    value={formData.format || ""} 
                    onChange={e => setFormData({ ...formData, format: e.target.value })}
                    placeholder="PDF + Google Sheet"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Product Pitch & Description</label>
                <textarea 
                  value={formData.description || ""} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  placeholder="Explain exactly what value and templates the buyer gets immediately after purchase..."
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">
                  Target Intent Keywords (Comma-Separated)
                </label>
                <input 
                  type="text" 
                  value={keywordInput} 
                  onChange={e => {
                    setKeywordInput(e.target.value);
                    const kws = e.target.value.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
                    setFormData({ ...formData, targetKeywords: kws });
                  }}
                  placeholder="staking, tax, defi, passive income, ledger"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  Any article matching these keywords will auto-display this product card.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">CTA Button Text</label>
                  <input 
                    type="text" 
                    value={formData.ctaText || ""} 
                    onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Get the Blueprint ($29)"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Download / Delivery Asset URL</label>
                  <input 
                    type="text" 
                    value={formData.downloadUrl || ""} 
                    onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="/downloads/asset.pdf"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Product Funnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instant Impulse Checkout Modal */}
      <InstantProductCheckoutModal 
        product={checkoutProduct} 
        onClose={() => setCheckoutProduct(null)} 
      />

    </div>
  );
}

