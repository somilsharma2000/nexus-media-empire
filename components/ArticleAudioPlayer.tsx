"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, RotateCcw, Sparkles, VolumeX } from "lucide-react";
import { trackHighIntentInteraction } from "@/lib/behavioral-engine";

interface AudioPlayerProps {
  title: string;
  readTime?: string;
  content?: string;
}

export default function ArticleAudioPlayer({ title, readTime = "5 min", content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  const cleanText = (raw?: string) => {
    if (!raw) return title;
    // Strip markdown formatting for speech
    return raw
      .replace(/#+\s+/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .slice(0, 3000); // Read first 3000 chars
  };

  const togglePlay = () => {
    if (!speechSupported) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      trackHighIntentInteraction("audio_play");
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const textToRead = `${title}. ... ${cleanText(content)}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = playbackRate;

        // Try to pick an English voice
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")));
        if (engVoice) utterance.voice = engVoice;

        utterance.onboundary = (e) => {
          if (textToRead.length > 0) {
            const pct = Math.min(100, Math.round((e.charIndex / textToRead.length) * 100));
            setProgress(pct);
          }
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const cycleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (isPlaying && speechSupported) {
      handleReset();
    }
  };

  return (
    <div className="my-8 p-4 rounded-2xl bg-gradient-to-r from-[#060b13] via-[#0b1322] to-[#060b13] border border-blue-900/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
          title={isPlaying ? "Pause Narration" : "Play Narration"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
            <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse text-emerald-400" : ""}`} /> 
            AI Voice Narration
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded">HD</span>
          </div>
          <p className="text-xs text-gray-200 font-medium line-clamp-1 max-w-sm">Listen to &quot;{title}&quot;</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-1/2">
        <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <button
          onClick={cycleSpeed}
          className="px-2 py-0.5 text-[10px] font-mono font-bold bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 rounded transition-colors"
          title="Playback Speed"
        >
          {playbackRate}x
        </button>

        <span className="text-[11px] font-mono text-gray-400 shrink-0">{readTime}</span>
        
        <button
          onClick={handleReset}
          className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-900 transition-colors"
          title="Restart Narration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
