"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Clock, CheckCircle, AlertTriangle, ShieldCheck, Zap, Activity } from "lucide-react";

interface JobConfig {
  id: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string;
  endpoint: string;
}

const DEFAULT_JOBS: JobConfig[] = [
  {
    id: "trend_scout",
    name: "Trend Scout & Content Ingestion",
    description: "Pulls Google Trends RSS, filters duplicates >60%, selects top topics and triggers AI generation.",
    schedule: "Every Day at 08:00 UTC",
    enabled: true,
    lastRun: "Today at 08:00 UTC",
    nextRun: "Tomorrow at 08:00 UTC",
    endpoint: "/api/pipeline/trend-scout",
  },
  {
    id: "publisher",
    name: "Autonomous Article Publisher",
    description: "Scans scheduled articles, releases due content, pings Google Indexing API, and updates dynamic sitemaps.",
    schedule: "Every Day at 09:00 UTC",
    enabled: true,
    lastRun: "Today at 09:00 UTC",
    nextRun: "Tomorrow at 09:00 UTC",
    endpoint: "/api/pipeline/publish",
  },
  {
    id: "health_monitor",
    name: "Infrastructure Health Monitor",
    description: "Validates all 3 niche frontends, verifies ads.txt presence, and dispatches Telegram alerts on failure.",
    schedule: "Every Day at 12:00 UTC",
    enabled: true,
    lastRun: "Today at 12:00 UTC",
    nextRun: "Tomorrow at 12:00 UTC",
    endpoint: "/api/monitor/cron",
  },
  {
    id: "content_doctor",
    name: "AI Content Doctor",
    description: "Evaluates evergreen content older than 60 days, updates statistics, adds changelogs, and passes QA.",
    schedule: "Mondays at 03:00 UTC",
    enabled: true,
    lastRun: "Last Monday at 03:00 UTC",
    nextRun: "Next Monday at 03:00 UTC",
    endpoint: "/api/content-doctor",
  },
  {
    id: "weekly_report",
    name: "Executive Weekly Digest",
    description: "Compiles total network revenue, top performing articles, subscriber deltas, and dispatches to phone.",
    schedule: "Sundays at 09:00 UTC",
    enabled: true,
    lastRun: "Last Sunday at 09:00 UTC",
    nextRun: "Next Sunday at 09:00 UTC",
    endpoint: "/api/report/weekly",
  },
  {
    id: "twitter_autopost",
    name: "Twitter/X Thread Auto-Dispatch",
    description: "Posts high-retention 6-tweet threads directly to X upon new article publication.",
    schedule: "Event Triggered (On Publish)",
    enabled: false,
    lastRun: null,
    nextRun: "Next Publish Event",
    endpoint: "/api/social/twitter",
  },
];

export default function AutomationControls() {
  const [jobs, setJobs] = useState<JobConfig[]>(DEFAULT_JOBS);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/automation/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setJobs((prev) =>
            prev.map((job) => ({
              ...job,
              enabled: data[job.id]?.enabled ?? job.enabled,
              lastRun: data[job.id]?.lastRun || job.lastRun,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggleJob = async (id: string) => {
    const updated = jobs.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j));
    setJobs(updated);

    const configMap: Record<string, any> = {};
    updated.forEach((j) => {
      configMap[j.id] = { enabled: j.enabled, schedule: j.schedule, lastRun: j.lastRun };
    });

    await fetch("/api/automation/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configMap),
    });
  };

  const handleRunNow = async (job: JobConfig) => {
    setRunningJob(job.id);
    setMessage(null);

    try {
      const res = await fetch(job.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer nexus-cron-secret",
        },
        body: JSON.stringify({ mode: "manual_trigger" }),
      });

      const data = await res.json();
      setMessage({
        id: job.id,
        text: `Execution completed: ${data.message || (data.published !== undefined ? `${data.published} published` : "Job finished successfully")}`,
        ok: true,
      });

      // Update last run
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, lastRun: "Just now" } : j))
      );
    } catch (err: any) {
      setMessage({ id: job.id, text: `Trigger failed: ${err.message}`, ok: false });
    } finally {
      setRunningJob(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Master Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#080d16] p-6 rounded-2xl border border-gray-800/80 gap-4 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-teal-400" /> Autonomous Chrono-Engine
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Master background cron execution schedule. Toggle daemons on/off or execute immediate ad-hoc runs.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold rounded-full shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5" /> All Daemons Operational
          </span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
              job.enabled
                ? "bg-[#080d16] border-gray-800/80 hover:border-gray-700 shadow-lg"
                : "bg-[#06090f]/60 border-gray-900 opacity-60"
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="font-bold text-white text-base tracking-tight">{job.name}</h4>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-medium ${
                    job.enabled
                      ? "bg-purple-950/60 text-purple-300 border border-purple-800/50"
                      : "bg-gray-900 text-gray-400 border border-gray-800"
                  }`}
                >
                  {job.schedule}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">{job.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1 font-mono">
                <span>Last Run: <strong className="text-gray-300 font-normal">{job.lastRun || "Never"}</strong></span>
                <span>•</span>
                <span>Next Scheduled: <strong className="text-blue-400 font-normal">{job.nextRun}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                onClick={() => handleRunNow(job)}
                disabled={runningJob === job.id}
                className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-2 border border-gray-700/80 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 text-yellow-400 ${runningJob === job.id ? "animate-spin" : ""}`} />
                {runningJob === job.id ? "Executing..." : "Run Now"}
              </button>

              <button
                onClick={() => toggleJob(job.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all active:scale-[0.98] ${
                  job.enabled
                    ? "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 shadow-lg shadow-emerald-950/30"
                    : "bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800"
                }`}
              >
                {job.enabled ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" /> : <Pause className="w-3.5 h-3.5" />}
                {job.enabled ? "Active" : "Paused"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2.5 ${
            message.ok ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60" : "bg-red-950/60 text-red-300 border border-red-800/60"
          }`}
        >
          {message.ok ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
