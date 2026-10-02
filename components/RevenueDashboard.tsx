"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart2,
  MousePointerClick,
  Wifi,
  WifiOff,
} from "lucide-react";

interface SiteRevenue {
  name: string;
  site: string;
  revenue: number;
  pageviews: number;
}

interface RevenueData {
  source: "live" | "demo";
  note?: string;
  syncedAt: string;
  network: {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    pageviews: number;
    rpm: number;
    ctr: number;
  };
  sites: SiteRevenue[];
}

interface AffiliateClicks {
  [slug: string]: number;
}

function minutesAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [affiliateClicks, setAffiliateClicks] = useState<AffiliateClicks>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [revRes, clickRes] = await Promise.all([
        fetch("/api/analytics/revenue", { cache: "no-store" }),
        fetch("/api/affiliates/clicks", { cache: "no-store" }),
      ]);

      if (!revRes.ok) throw new Error("Failed to fetch revenue data");

      const revData: RevenueData = await revRes.json();
      setData(revData);

      if (clickRes.ok) {
        const clicks: AffiliateClicks = await clickRes.json();
        setAffiliateClicks(clicks);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalAffiliateClicks = Object.values(affiliateClicks).reduce(
    (s, v) => s + v,
    0
  );

  const maxSiteRevenue = data
    ? Math.max(...data.sites.map((s) => s.revenue), 1)
    : 1;

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm font-medium">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900/50 border border-red-900/50 rounded-xl p-8 text-center">
        <p className="text-red-400 font-semibold">
          {error ?? "No data available"}
        </p>
        <button
          onClick={() => fetchAll()}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const minAgo = minutesAgo(data.syncedAt);

  return (
    <div className="space-y-6">
      {/* Demo / Live Banner */}
      {data.source === "demo" ? (
        <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-4">
          <WifiOff className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-bold text-sm">
              DEMO DATA — Connect Google AdSense to see real earnings.
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              Add credentials to <code className="font-mono">.env</code>:{" "}
              <span className="font-mono">GOOGLE_ADSENSE_CLIENT_ID</span> and{" "}
              <span className="font-mono">GOOGLE_ADSENSE_CLIENT_SECRET</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/50 rounded-xl px-5 py-3">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-bold text-sm">Live Data</span>
          <span className="text-green-700 text-xs ml-1">
            — connected to Google AdSense
          </span>
        </div>
      )}

      {/* Hero Revenue Number */}
      <div className="bg-gradient-to-br from-green-900/20 to-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Today&apos;s Revenue
            </p>
            <p className="text-6xl font-bold text-green-400 tabular-nums">
              ${fmt(data.network.todayRevenue)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Synced {minAgo === 0 ? "just now" : `${minAgo}m ago`}</span>
            </div>
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
          label="7-Day Total"
          value={`$${fmt(data.network.weekRevenue)}`}
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-green-400" />}
          label="30-Day Total"
          value={`$${fmt(data.network.monthRevenue)}`}
        />
        <StatCard
          icon={<Eye className="w-4 h-4 text-purple-400" />}
          label="Pageviews"
          value={data.network.pageviews.toLocaleString()}
        />
        <StatCard
          icon={<BarChart2 className="w-4 h-4 text-yellow-400" />}
          label="RPM"
          value={`$${fmt(data.network.rpm)}`}
        />
        <StatCard
          icon={<MousePointerClick className="w-4 h-4 text-orange-400" />}
          label="CTR"
          value={`${fmt(data.network.ctr, 2)}%`}
        />
      </div>

      {/* Affiliate Clicks */}
      {totalAffiliateClicks > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="w-4 h-4 text-orange-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Affiliate Clicks (Today)
            </h4>
            <span className="ml-auto text-orange-400 font-bold text-sm">
              {totalAffiliateClicks} total
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(affiliateClicks).map(([slug, count]) => (
              <div key={slug} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 font-mono w-40 truncate">
                  {slug}
                </span>
                <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        (count / Math.max(totalAffiliateClicks, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-white font-semibold w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-site Revenue Bar Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          Per-Site Revenue
        </h4>
        <div className="space-y-5">
          {data.sites.map((site) => {
            const pct =
              maxSiteRevenue > 0
                ? (site.revenue / maxSiteRevenue) * 100
                : 0;
            return (
              <div key={site.site}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {site.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
                      {site.site}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      {site.pageviews.toLocaleString()} views
                    </span>
                    <span className="font-bold text-green-400 text-sm">
                      ${fmt(site.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, data.source === "demo" ? 0 : 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {data.source === "demo" && (
          <p className="text-xs text-gray-600 mt-4 italic">
            All bars will populate once AdSense is connected.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
