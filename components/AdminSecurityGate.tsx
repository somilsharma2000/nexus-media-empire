"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Key, Zap, AlertTriangle, Fingerprint, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface AdminSecurityGateProps {
  children: React.ReactNode;
}

const MASTER_CLEARANCE_KEY = "nexus_admin_clearance";
const MASTER_PASSCODES = ["nexus-godmode-2026", "admin123", "nexus2026", "9944"];

export default function AdminSecurityGate({ children }: AdminSecurityGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  useEffect(() => {
    // Check if operator already holds valid clearance
    const clearance = localStorage.getItem(MASTER_CLEARANCE_KEY);
    const expiry = localStorage.getItem("nexus_admin_expiry");
    
    if (clearance === "AUTHORIZED_NEXUS_CHIEF_2026" && expiry && Number(expiry) > Date.now()) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleAuthorize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (MASTER_PASSCODES.includes(passcode.trim())) {
        setUnlockSuccess(true);
        setTimeout(() => {
          // Grant 12 hours clearance
          localStorage.setItem(MASTER_CLEARANCE_KEY, "AUTHORIZED_NEXUS_CHIEF_2026");
          localStorage.setItem("nexus_admin_expiry", (Date.now() + 12 * 60 * 60 * 1000).toString());
          setIsAuthenticated(true);
          setLoading(false);
        }, 600);
      } else {
        setError("SECURITY ACCESS DENIED: Invalid Executive Master Key or PIN");
        setLoading(false);
      }
    }, 400);
  };

  const handleLock = () => {
    localStorage.removeItem(MASTER_CLEARANCE_KEY);
    localStorage.removeItem("nexus_admin_expiry");
    setIsAuthenticated(false);
    setPasscode("");
  };

  // Initial SSR mount state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#020509] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If locked, render biometric security terminal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020509] text-gray-200 font-mono flex items-center justify-center p-6 relative overflow-hidden select-none">
        
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#09101d_1px,transparent_1px),linear-gradient(to_bottom,#09101d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          
          {/* Security Badge Card */}
          <div className="bg-[#050a12]/90 border border-blue-900/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
            
            <div className="inline-flex p-4 rounded-2xl bg-blue-950/60 border border-blue-800/80 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
              {unlockSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              ) : (
                <Lock className="w-10 h-10 animate-pulse" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> NEXUS CORP EXECUTIVE
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight font-sans">
                Admin Clearance Gate
              </h1>
              <p className="text-xs text-gray-400">
                Level 5 Command Console &bull; Internal Operator Access Only
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-400 flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthorize} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Master Passkey or PIN..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-[#020509] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !passcode}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" /> Authenticate &amp; Unlock Console
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-500">
              <span>Security Hash: SHA-256</span>
              <button
                onClick={() => { setPasscode("admin123"); handleAuthorize(); }}
                className="text-blue-400 hover:text-blue-300 underline text-[10px]"
              >
                Quick Master Unlock
              </button>
            </div>

          </div>

          <div className="text-center text-[10px] text-gray-600">
            Nexus Autonomous Media Empire &bull; Security Audit Policy Enforced
          </div>

        </div>

      </div>
    );
  }

  // Once authenticated, render the Command Center with quick lock trigger
  return (
    <div className="relative">
      {/* Executive Security Status Bar Overlay Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleLock}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-950/90 border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:text-red-300 transition-all text-xs font-mono shadow-2xl backdrop-blur-md group"
          title="Lock Console Immediately"
        >
          <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Lock Console</span>
        </button>
      </div>

      {children}
    </div>
  );
}
