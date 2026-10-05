"use client";

import React, { useState, useEffect } from "react";
import { Activity, ArrowUpRight, ArrowDownLeft, Shield, Fuel, Zap, Globe } from "lucide-react";

interface WhaleTx {
  id: string;
  asset: string;
  amount: string;
  valueUsd: string;
  from: string;
  to: string;
  type: "inflow" | "outflow" | "otc";
  timeAgo: string;
}

const INITIAL_TXS: WhaleTx[] = [
  { id: "tx-1", asset: "BTC", amount: "1,450 BTC", valueUsd: "$181.2M", from: "Unknown Whale Wallet", to: "Coinbase Prime Custody", type: "inflow", timeAgo: "2m ago" },
  { id: "tx-2", asset: "SOL", amount: "142,000 SOL", valueUsd: "$31.8M", from: "Kraken OTC Desk", to: "Institutional Cold Storage", type: "outflow", timeAgo: "6m ago" },
  { id: "tx-3", asset: "ETH", amount: "18,900 ETH", valueUsd: "$79.0M", from: "Binance Hot Wallet", to: "Lido Liquid Staking", type: "otc", timeAgo: "14m ago" },
  { id: "tx-4", asset: "USDC", amount: "50,000,000 USDC", valueUsd: "$50.0M", from: "Circle Treasury", to: "BlackRock BUIDL Fund", type: "inflow", timeAgo: "22m ago" },
];

export default function GodModeWhaleTracker() {
  const [transactions, setTransactions] = useState<WhaleTx[]>(INITIAL_TXS);
  const [gasGwei, setGasGwei] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setGasGwei(Math.floor(10 + Math.random() * 12));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#030905] border border-green-900/40 rounded-3xl p-6 sm:p-8 space-y-6 my-10 font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-green-900/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Smart Money &amp; Whale Transaction Radar
            </h3>
            <span className="text-[10px] bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded">
              ON-CHAIN
            </span>
          </div>
          <p className="text-xs text-gray-400">Tracking $10M+ institutional liquidity movements in real time.</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Fuel className="w-3.5 h-3.5 text-green-400" />
            <span>ETH Gas:</span>
            <span className="text-green-400 font-bold">{gasGwei} Gwei</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Solana TPS:</span>
            <span className="text-white font-bold">3,840</span>
          </div>
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-4 rounded-2xl bg-[#020503] border border-green-900/30 hover:border-green-700/60 transition-all space-y-2 text-xs"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {tx.type === "inflow" ? (
                  <span className="p-1 rounded-lg bg-green-950/80 text-green-400 border border-green-800/60">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className="font-bold text-white">{tx.amount}</span>
              </div>
              <span className="text-green-400 font-bold">{tx.valueUsd}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t border-gray-900">
              <span className="truncate max-w-[180px]">
                {tx.from} → {tx.to}
              </span>
              <span className="text-gray-400">{tx.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
