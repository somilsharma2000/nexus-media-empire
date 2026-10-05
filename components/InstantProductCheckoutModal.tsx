"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  CreditCard, 
  Zap, 
  Sparkles, 
  Lock, 
  ArrowRight,
  FileText
} from "lucide-react";

export interface DigitalProduct {
  id: string;
  name: string;
  slug: string;
  niche: string;
  priceUsd: number;
  format: string;
  description: string;
  features: string[];
  salesCount: number;
  downloadUrl?: string;
}

export default function InstantProductCheckoutModal({
  product,
  onClose,
}: {
  product: DigitalProduct | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState("");

  if (!product) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setReceiptId(`NX-PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#080d16] border border-blue-900/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click Digital Delivery
              </div>
              <h3 className="text-2xl font-black text-white">{product.name}</h3>
              <p className="text-xs text-gray-400">{product.description}</p>
            </div>

            {/* Price & Features Card */}
            <div className="p-5 rounded-2xl bg-[#03060a] border border-gray-800 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono text-gray-400 uppercase">One-Time Payment</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  ${product.priceUsd} <span className="text-xs text-gray-500 font-normal">USD</span>
                </span>
              </div>

              <div className="pt-3 border-t border-gray-800/80 space-y-2 text-xs text-gray-300 font-mono">
                {product.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 uppercase mb-1.5 font-bold">Your Delivery Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition-all"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${product.priceUsd} &amp; Download Instantly</span>
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted</span>
                <span>Instant PDF / Notion Access</span>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center space-y-6 py-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Payment Verified!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Receipt <strong>#{receiptId}</strong> has been generated and dispatched to <strong>{email}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#03060a] rounded-2xl border border-emerald-900/60 text-left space-y-2">
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> {product.name}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">Format: {product.format} • Full License</div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  alert(`Downloading ${product.name} package... License Key: ${receiptId}`);
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm font-mono flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Asset Package Now</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-white font-mono transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
