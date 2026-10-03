"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Clock, CheckCircle, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

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
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between bg-gray-950 p-6 rounded-2xl border border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Autonomous Chrono-Engine
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Master execution schedule. Toggle routines on/off or execute immediate ad-hoc runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-950/60 border border-green-800 text-green-400 text-xs font-semibold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> All Daemons Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              job.enabled
                ? "bg-gray-950/80 border-gray-800/80 hover:border-gray-700"
                : "bg-gray-950/30 border-gray-900 opacity-60"
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-white text-base">{job.name}</h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    job.enabled
                      ? "bg-purple-900/30 text-purple-300 border border-purple-800/50"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {job.schedule}
                </span>
              </div>
              <p className="text-xs text-gray-400 max-w-2xl">{job.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span>Last Run: <strong className="text-gray-300">{job.lastRun || "Never"}</strong></span>
                <span>•</span>
                <span>Next Scheduled: <strong className="text-blue-400">{job.nextRun}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button
                onClick={() => handleRunNow(job)}
                disabled={runningJob === job.id}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 transition-all"
              >
                <Zap className={`w-3.5 h-3.5 text-yellow-400 ${runningJob === job.id ? "animate-spin" : ""}`} />
                {runningJob === job.id ? "Executing..." : "Run Now"}
              </button>

              <button
                onClick={() => toggleJob(job.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  job.enabled
                    ? "bg-green-950/80 hover:bg-green-900 text-green-300 border border-green-800"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"
                }`}
              >
                {job.enabled ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {job.enabled ? "Active" : "Paused"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2 ${
            message.ok ? "bg-green-950/60 text-green-300 border border-green-900" : "bg-red-950/60 text-red-300 border border-red-900"
          }`}
        >
          {message.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
