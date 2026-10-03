"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Volume2, RotateCcw, Sparkles } from "lucide-react";

interface AudioPlayerProps {
  title: string;
  readTime?: string;
}

export default function ArticleAudioPlayer({ title, readTime = "5 min" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="my-8 p-4 rounded-2xl bg-gradient-to-r from-gray-950 via-blue-950/20 to-gray-950 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-all shadow-lg shadow-blue-600/30"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" /> AI Audio Narration
          </div>
          <p className="text-xs text-gray-300 font-medium line-clamp-1">Listen to &quot;{title}&quot;</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-1/2">
        <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] font-mono text-gray-400 shrink-0">{readTime} listen</span>
        <button
          onClick={handleReset}
          className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-900 transition-colors"
          title="Restart"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
