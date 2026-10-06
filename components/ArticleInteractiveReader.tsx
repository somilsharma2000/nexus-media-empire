"use client";

import React, { useState } from "react";
import ReaderToolbar from "./ReaderToolbar";
import InstantProductCheckoutModal, { DigitalProduct } from "./InstantProductCheckoutModal";
import { Zap, CheckCircle, Download } from "lucide-react";

interface ArticleInteractiveReaderProps {
  title: string;
  url: string;
  product: DigitalProduct;
  children: React.ReactNode;
}

export default function ArticleInteractiveReader({
  title,
  url,
  product,
  children,
}: ArticleInteractiveReaderProps) {
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<DigitalProduct | null>(null);

  const handleFontSizeChange = (delta: number) => {
    setFontSizeOffset((prev) => Math.max(-2, Math.min(4, prev + delta)));
  };

  return (
    <>
      {selectedProductForCheckout && (
        <InstantProductCheckoutModal
          product={selectedProductForCheckout}
          onClose={() => setSelectedProductForCheckout(null)}
        />
      )}

      {/* Reader Floating Toolbar */}
      <ReaderToolbar
        title={title}
        url={url}
        onFontSizeChange={handleFontSizeChange}
      />

      {/* Content wrapper with font scale */}
      <div style={{ fontSize: `${16 + fontSizeOffset}px` }}>
        {children}
      </div>

      {/* High-Converting Digital Product Pitch */}
      {product && (
        <div className="my-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0c1626] via-[#09101d] to-[#040810] border-2 border-blue-500/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> Official Release • 2026 Edition
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Instant Delivery + License Key
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                {product.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {product.features.map((feat, idx) => (
                  <span key={idx} className="text-[11px] font-mono bg-black/40 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-800 flex items-center gap-1">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto p-5 rounded-2xl bg-black/60 border border-blue-500/30 flex flex-col items-center justify-center text-center space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-400 block">Instant Access</span>
                <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">${product.priceUsd}</span>
                  <span className="text-xs text-gray-500 line-through">${product.priceUsd * 2}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">or ₹{Math.round(product.priceUsd * 85)} via UPI</span>
              </div>

              <button
                onClick={() => setSelectedProductForCheckout(product)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Instant Bundle
              </button>
              <span className="text-[9px] text-gray-500 font-mono">SSL Encrypted • 30-Day Guarantee</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
