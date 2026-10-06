"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, Zap, ArrowRight, Activity, Terminal } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("admin@nexus.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials. Use admin@nexus.com / admin123");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setEmail("admin@nexus.com");
    setPassword("admin123");
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: "admin@nexus.com",
        password: "admin123",
        callbackUrl,
      });

      if (res?.error) {
        setError("Default credentials failed.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030508] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            NEXUS <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-normal">v4.2</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">AUTONOMOUS MEDIA EMPIRE • COMMAND CENTER</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#080d16]/90 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-gray-300">Executive Clearance</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Systems
            </span>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Commander Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                placeholder="admin@nexus.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Master Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#03060a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authorize Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Dev Login */}
          <div className="mt-6 pt-6 border-t border-gray-800/80">
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gray-900/80 hover:bg-gray-800/90 text-gray-300 hover:text-white border border-gray-700/60 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>One-Click Dev Access (admin@nexus.com)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-gray-500 font-mono">
          E-E-A-T Autonomous Network Engine • Port 3002
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#030508] flex items-center justify-center text-gray-500 font-mono text-xs">Loading Command Center...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
