import React from "react";
import { Sparkles, CheckCircle2, Bot } from "lucide-react";

interface LlmAnswerBoxProps {
  title: string;
  summary: string;
  keyFacts: string[];
  lastVerified?: string;
}

export default function LlmAnswerBox({
  title,
  summary,
  keyFacts,
  lastVerified = "October 2026",
}: LlmAnswerBoxProps) {
  return (
    <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-purple-950/20 to-gray-950 border border-blue-500/30 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/10 border-b border-l border-blue-500/20 text-[10px] font-mono text-blue-400 rounded-bl-xl flex items-center gap-1.5">
        <Bot className="w-3 h-3 text-blue-400" />
        <span>GEO / AI Overview Summary</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-sm font-bold text-white tracking-wide">
          Quick Verdict: {title}
        </h4>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed mb-3">
        {summary}
      </p>

      {keyFacts && keyFacts.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-gray-800/80">
          {keyFacts.map((fact, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{fact}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-[10px] text-gray-500 font-mono text-right">
        Verified by Nexus Editorial Engine • {lastVerified}
      </div>
    </div>
  );
}
