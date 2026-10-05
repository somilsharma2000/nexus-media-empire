"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { BrainCircuit, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Check ADMIN_EMAIL & ADMIN_PASSWORD_HASH.");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4">
      <div className="w-full max-w-md p-8 bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500"></div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-wider">
            NEXUS<span className="text-blue-500">COMMAND</span>
          </h1>
        </div>

        <p className="text-xs text-gray-400 text-center mb-8">
          Secure biometric & credential gateway for the Autonomous Media Empire.
        </p>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexus.com"
              className="w-full p-3.5 rounded-xl bg-black border border-gray-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 rounded-xl bg-black border border-gray-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Gateway...</span>
            ) : (
              <>
                <span>Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-900 text-center text-[10px] text-gray-600 font-mono">
          E-E-A-T Enterprise Node • 256-Bit SSL Encrypted
        </div>
      </div>
    </div>
  );
}
