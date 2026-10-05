"use client";

export interface UserBehaviorProfile {
  pageviews: number;
  totalDwellSeconds: number;
  maxScrollDepth: number;
  categoryAffinity: Record<string, number>;
  buyerIntentScore: number;
  engagementTier: "skimmer" | "reader" | "deep_diver" | "high_intent_buyer";
  lastActive: string;
}

const STORAGE_KEY = "nexus_user_behavior_v2";

const DEFAULT_PROFILE: UserBehaviorProfile = {
  pageviews: 0,
  totalDwellSeconds: 0,
  maxScrollDepth: 0,
  categoryAffinity: { news: 0, crypto: 0, finance: 0 },
  buyerIntentScore: 0,
  engagementTier: "skimmer",
  lastActive: new Date().toISOString(),
};

/** Get stored behavior profile from client storage */
export function getBehaviorProfile(): UserBehaviorProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw) as UserBehaviorProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

/** Save updated behavior profile */
export function saveBehaviorProfile(profile: UserBehaviorProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

/** Increment pageview and category affinity */
export function trackPageView(niche: string): UserBehaviorProfile {
  const profile = getBehaviorProfile();
  profile.pageviews += 1;
  profile.categoryAffinity[niche] = (profile.categoryAffinity[niche] || 0) + 3;
  profile.lastActive = new Date().toISOString();
  updateTier(profile);
  saveBehaviorProfile(profile);
  return profile;
}

/** Track reading dwell time (seconds) */
export function trackDwellTime(seconds: number): UserBehaviorProfile {
  const profile = getBehaviorProfile();
  profile.totalDwellSeconds += seconds;
  if (profile.totalDwellSeconds > 60) {
    profile.buyerIntentScore = Math.min(100, profile.buyerIntentScore + 2);
  }
  updateTier(profile);
  saveBehaviorProfile(profile);
  return profile;
}

/** Track scroll depth (percentage 0 - 100) */
export function trackScrollDepth(depthPercent: number): UserBehaviorProfile {
  const profile = getBehaviorProfile();
  if (depthPercent > profile.maxScrollDepth) {
    profile.maxScrollDepth = Math.round(depthPercent);
    if (depthPercent > 70) {
      profile.buyerIntentScore = Math.min(100, profile.buyerIntentScore + 5);
    }
    updateTier(profile);
    saveBehaviorProfile(profile);
  }
  return profile;
}

/** Track high-intent click (e.g. calculator, pricing, affiliate link, table click) */
export function trackHighIntentInteraction(type: "calculator" | "affiliate" | "product_preview" | "audio_play" | "poll"): UserBehaviorProfile {
  const profile = getBehaviorProfile();
  const pointsMap = {
    calculator: 15,
    affiliate: 25,
    product_preview: 20,
    audio_play: 10,
    poll: 8,
  };
  profile.buyerIntentScore = Math.min(100, profile.buyerIntentScore + (pointsMap[type] || 5));
  updateTier(profile);
  saveBehaviorProfile(profile);
  return profile;
}

/** Helper to recompute engagement tier */
function updateTier(profile: UserBehaviorProfile): void {
  if (profile.buyerIntentScore >= 45 || (profile.totalDwellSeconds > 90 && profile.maxScrollDepth > 65)) {
    profile.engagementTier = "high_intent_buyer";
  } else if (profile.totalDwellSeconds > 45 && profile.maxScrollDepth > 50) {
    profile.engagementTier = "deep_diver";
  } else if (profile.totalDwellSeconds > 15 || profile.maxScrollDepth > 25) {
    profile.engagementTier = "reader";
  } else {
    profile.engagementTier = "skimmer";
  }
}

/** Get optimal contextual offer matching the user's live intent */
export function getSmartContextualOffer(niche: string, profile: UserBehaviorProfile) {
  // Dominant affinity
  const affinities = Object.entries(profile.categoryAffinity);
  affinities.sort((a, b) => b[1] - a[1]);
  const dominantNiche = affinities[0]?.[0] || niche || "news";

  if (profile.engagementTier === "high_intent_buyer") {
    if (dominantNiche === "crypto") {
      return {
        badge: "VERIFIED HIGH-INTENT OFFER",
        headline: "Ledger Flex: Military-Grade Cold Storage",
        subtext: "Protect your digital wealth with EAL6+ secure element chips & Bluetooth encryption.",
        ctaText: "Claim Exclusive Deal →",
        ctaUrl: "/go/ledger-wallet",
        urgency: "Exclusive 20% Rebate Applied",
        color: "emerald",
      };
    }
    if (dominantNiche === "finance") {
      return {
        badge: "EXECUTIVE TRADER SELECTION",
        headline: "TradingView Pro+ Annual Pass",
        subtext: "Institutional-grade volume profiles, multi-timeframe backtesting & instant signals.",
        ctaText: "Activate 30-Day Pass →",
        ctaUrl: "/go/tradingview-pro",
        urgency: "Complimentary Trial Available",
        color: "blue",
      };
    }
    return {
      badge: "EXECUTIVE OPERATOR BUNDLE",
      headline: "Nexus Autonomous Media Operating System",
      subtext: "Complete Notion architecture, prompts, and automation scripts ($0 COGS instant delivery).",
      ctaText: "Download Complete Toolkit ($39) →",
      ctaUrl: "#product-funnel",
      urgency: "Instant Download • 100% Margin",
      color: "purple",
    };
  }

  if (profile.engagementTier === "deep_diver") {
    return {
      badge: "RECOMMENDED PRACTITIONER TOOL",
      headline: `Top-Rated ${dominantNiche.toUpperCase()} Toolkit for 2026`,
      subtext: "Curated, verified by Nexus analysts with step-by-step implementation templates.",
      ctaText: "Explore Verified Toolkit →",
      ctaUrl: dominantNiche === "crypto" ? "/go/ledger-wallet" : "/go/tradingview-pro",
      urgency: "Trending in Editorial Briefs",
      color: "indigo",
    };
  }

  // Generic fallback for skimmers
  return {
    badge: "FEATURED PARTNER",
    headline: "Automate Your Research & Portfolio Workflow",
    subtext: "Access institutional data pipelines and real-time anomaly alerts.",
    ctaText: "View Solution →",
    ctaUrl: "/news",
    urgency: "Free Tier Available",
    color: "gray",
  };
}
