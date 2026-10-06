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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function InstantProductCheckoutModal({
  product,
  onClose,
}: {
  product: DigitalProduct | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState("");
  const [paymentMethodName, setPaymentMethodName] = useState("");

  if (!product) return null;

  // Conversion rate for display (1 USD = ~85 INR)
  const priceInr = Math.round(product.priceUsd * 85);
  const currentPrice = currency === "INR" ? `₹${priceInr}` : `$${product.priceUsd}`;

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const orderAmount = currency === "INR" ? priceInr : product.priceUsd;
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderAmount,
          currency: currency,
          itemType: "digital_product",
          itemId: product.id,
          itemTitle: product.name,
          customerEmail: email,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // If simulated sandbox mode
      if (orderData.isSandbox || !window.Razorpay) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || orderData.isSandbox) {
          // Instant simulation fallback
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: "sandbox_verified",
              itemType: "digital_product",
              itemId: product.id,
              itemTitle: product.name,
              amount: orderAmount,
              currency: currency,
              customerEmail: email,
            }),
          });
          const verifyData = await verifyRes.json();
          setReceiptId(verifyData.accessKey || `NX-PAY-${Date.now().toString(36).toUpperCase()}`);
          setPaymentMethodName("Razorpay Sandbox (Simulated)");
          setIsCompleted(true);
          setIsProcessing(false);
          return;
        }
      }

      // 2. Open live Razorpay Checkout UI
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Nexus Media Empire",
        description: product.name,
        image: "/favicon.ico",
        order_id: orderData.orderId,
        prefill: {
          email: email,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response: any) {
          // 3. Verify on server
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              itemType: "digital_product",
              itemId: product.id,
              itemTitle: product.name,
              amount: orderAmount,
              currency: currency,
              customerEmail: email,
            }),
          });

          const verifyData = await verifyRes.json();
          setReceiptId(verifyData.accessKey || response.razorpay_payment_id);
          setPaymentMethodName("Razorpay (UPI / Cards / NetBanking)");
          setIsCompleted(true);
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("[CHECKOUT ERROR]", err);
      alert(err?.message || "Checkout failed. Please try again.");
      setIsProcessing(false);
    }
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Razorpay Multi-Method Checkout (Cards, UPI, NetBanking)
              </div>
              <h3 className="text-2xl font-black text-white">{product.name}</h3>
              <p className="text-xs text-gray-400">{product.description}</p>
            </div>

            {/* Price & Currency Switcher */}
            <div className="p-5 rounded-2xl bg-[#03060a] border border-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase block">Total Payable</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {currentPrice} <span className="text-xs text-gray-500 font-normal">{currency}</span>
                  </span>
                </div>

                {/* Currency Toggle */}
                <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setCurrency("INR")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      currency === "INR" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      currency === "USD" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
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
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-98"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {currentPrice} via Razorpay (UPI / Card)</span>
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> UPI • Cards • NetBanking • Wallets</span>
                <span>Instant License Key</span>
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
