"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

interface CalculatorProps {
  type?: "compound" | "dca";
}

export default function InteractiveCalculator({ type = "compound" }: CalculatorProps) {
  const [amount, setAmount] = useState(500);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(12);

  // Compound interest calculation
  const monthlyRate = returnRate / 100 / 12;
  const months = years * 12;
  const futureValue = Math.round(
    amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const totalInvested = amount * months;
  const totalGains = futureValue - totalInvested;

  return (
    <div className="my-10 p-6 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-gray-800 shadow-2xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
        <Calculator className="w-4 h-4" /> Interactive Growth Simulator
      </div>

      <h4 className="text-lg font-bold text-white mb-2">
        {type === "dca" ? "Dollar-Cost Averaging Projection" : "Compound Growth Calculator"}
      </h4>
      <p className="text-xs text-gray-400 mb-6">
        Simulate monthly systematic contributions and compound returns over time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 text-xs">
        <div>
          <label className="block text-gray-400 font-semibold mb-1">Monthly Contribution (₹ / $)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-400 font-semibold mb-1">Time Horizon ({years} Years)</label>
          <input
            type="range"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-emerald-500 mt-2"
          />
        </div>

        <div>
          <label className="block text-gray-400 font-semibold mb-1">Expected Annual Return ({returnRate}%)</label>
          <input
            type="range"
            min={4}
            max={30}
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            className="w-full accent-emerald-500 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-center">
        <div className="p-3 bg-gray-950 rounded-xl border border-gray-900">
          <span className="text-[11px] text-gray-500 uppercase font-semibold">Total Invested</span>
          <div className="text-base font-bold font-mono text-gray-300 mt-0.5">
            ${totalInvested.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-950 rounded-xl border border-gray-900">
          <span className="text-[11px] text-gray-500 uppercase font-semibold">Est. Wealth Created</span>
          <div className="text-base font-bold font-mono text-green-400 mt-0.5">
            +${totalGains.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/60">
          <span className="text-[11px] text-emerald-400 uppercase font-bold">Future Portfolio Value</span>
          <div className="text-xl font-black font-mono text-white mt-0.5">
            ${futureValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
