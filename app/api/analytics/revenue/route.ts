import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "analytics_cache.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

interface CacheFile {
  cachedAt: string | null;
  data: RevenueData | null;
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
  sites: Array<{
    name: string;
    site: string;
    revenue: number;
    pageviews: number;
  }>;
}

async function readCache(): Promise<CacheFile> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheFile;
  } catch {
    return { cachedAt: null, data: null };
  }
}

async function writeCache(data: RevenueData): Promise<void> {
  const payload: CacheFile = {
    cachedAt: new Date().toISOString(),
    data,
  };
  await fs.writeFile(CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
}

function isCacheFresh(cachedAt: string | null): boolean {
  if (!cachedAt) return false;
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

function buildDemoData(): RevenueData {
  return {
    source: "demo",
    note: "Add GOOGLE_ADSENSE_CLIENT_ID and GOOGLE_ADSENSE_CLIENT_SECRET to connect real AdSense data",
    syncedAt: new Date().toISOString(),
    network: {
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      pageviews: 0,
      rpm: 0,
      ctr: 0,
    },
    sites: [
      { name: "The Trend Matrix", site: "news", revenue: 0, pageviews: 0 },
      { name: "Crypto Daily", site: "crypto", revenue: 0, pageviews: 0 },
      { name: "Wall St Insider", site: "finance", revenue: 0, pageviews: 0 },
    ],
  };
}

async function fetchLiveAdSenseData(
  clientId: string,
  clientSecret: string
): Promise<RevenueData> {
  // In production, exchange clientSecret for an OAuth token using the
  // Google OAuth2 "service account" or stored refresh-token flow, then
  // call the AdSense Management API v2.
  // For now we fall back to demo data since no refresh token is stored.
  console.log(
    "[AdSense] Credentials found:",
    clientId.slice(0, 8) + "...",
    "— OAuth flow not yet wired; returning demo data."
  );
  const demo = buildDemoData();
  demo.source = "demo";
  demo.note =
    "Credentials detected but OAuth refresh token not configured. See /docs/adsense-setup for the full OAuth flow.";
  return demo;
}

export async function GET() {
  // Check cache first
  const cache = await readCache();
  if (isCacheFresh(cache.cachedAt) && cache.data) {
    return NextResponse.json(cache.data);
  }

  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET;

  let data: RevenueData;

  if (clientId && clientSecret) {
    data = await fetchLiveAdSenseData(clientId, clientSecret);
  } else {
    data = buildDemoData();
  }

  // Persist to cache
  try {
    await writeCache(data);
  } catch (err) {
    console.warn("[analytics/revenue] Could not write cache:", err);
  }

  return NextResponse.json(data);
}
