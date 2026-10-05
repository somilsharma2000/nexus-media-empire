# 🤖 AGENT OPERATING MANUAL & CODEBASE SPECIFICATION
### Technical Architecture & Guidelines for Autonomous AI Agents

---

## 1. Codebase Directory Map

```
media-empire/
├── app/
│   ├── page.tsx                     # Master God-Mode Command Center (Tabs & Views)
│   ├── layout.tsx                   # Global Root Layout & Metadata
│   ├── sitemap.ts                   # Dynamic sitemap generator (Reads all 90 articles)
│   ├── robots.ts                    # Dynamic robots.txt with AI-crawler allowlist
│   ├── admin/login/page.tsx         # NextAuth credentials login page
│   ├── [niche]/                     # Public Publication Frontends
│   │   ├── page.tsx                 # Niche index (/news, /crypto, /finance)
│   │   ├── [slug]/page.tsx          # Dynamic Article Reader & Interactive Widgets
│   │   └── (about, contact, etc.)   # Mandatory E-E-A-T policy pages
│   ├── go/[slug]/route.ts           # Dynamic Affiliate Cloaker & Click Logger
│   └── api/                         # Autonomous Backend API Engine
│       ├── articles/                # Article CRUD, Search, Internal Links, View Tracking
│       ├── generate/                # Multi-Pass AI Generation + Token Usage Budget
│       ├── qa-review/               # 5-Dimension AI Self-Reviewer & E-E-A-T Gate
│       ├── pipeline/                # Autonomous loop (trend-scout, publish, status, control)
│       ├── products/                # Digital Product CRUD & Intent Matcher
│       ├── adslots/                 # Ad Slot Manager, Toggles & Emergency Killswitch
│       ├── affiliates/              # Affiliate Link CRUD & Click Analytics
│       ├── social/                  # Twitter, Reddit, Medium auto-dispatchers
│       ├── telegram/                # Webhook & Mobile Bot Controller (Grammy)
│       ├── monitor/                 # Health check, site uptime & crawl error alerts
│       ├── seo/                     # IndexNow API search pings & Rising Keywords
│       ├── newsletter/              # Beehiiv sync, broadcast sender & subscriber stats
│       ├── content-doctor/          # 60-day article refresher & 90-day pruning
│       └── rss/                     # Dynamic XML RSS feeds for feed aggregators
├── components/                      # UI Component Library (Tailwind + Framer Motion)
│   ├── GodModeHub.tsx               # Master 1-Click Loop & Revenue Forecaster
│   ├── OmniSocialDashboard.tsx      # 5-Brand Social Switcher & Omni-Blast Generator
│   ├── DigitalProductManager.tsx    # Digital Products Catalog & Intent Matcher
│   ├── ViralHookStudio.tsx          # 7 Psychological Hook Archetypes Studio
│   ├── ArticleManager.tsx           # Full Article CRUD, QA Scores & Human Gate
│   ├── TopicManager.tsx             # Topic backlog & 1-click generation
│   ├── AdSlotManager.tsx            # Ad Slot Customizer & Master Killswitch
│   ├── AffiliateManager.tsx         # Affiliate Link Manager & /go/[slug] URLs
│   ├── PosterStudio.tsx             # Social Media Visuals & OG Banner Generator
│   ├── RevenueDashboard.tsx         # Real-time revenue, RPM & CTR metrics
│   ├── AlertFeed.tsx                # System health, crawl errors & uptime monitor
│   ├── AutomationControls.tsx       # Chrono Cron schedules & manual triggers
│   ├── ConnectionsHub.tsx           # External service integration status
│   ├── QAConfigPanel.tsx            # Editorial score thresholds & budget sliders
│   ├── SettingsPanel.tsx            # Browser-based API credential manager
│   ├── CookieConsent.tsx            # AdSense/GDPR-compliant cookie banner
│   └── (Article Reader Components)  # GeoSchema, LlmAnswerBox, DynamicAffiliateBox, etc.
├── data/                            # File-Based JSON Storage Engine
│   ├── articles.json                # 90 Evergreen guides + metadata + QA scores
│   ├── digital_products.json        # Active digital product funnels & intent keywords
│   ├── adslots.json                 # Ad unit configurations & targeting rules
│   ├── affiliate_links.json         # Affiliate links & commission estimates
│   ├── topics.json                  # Ingested topics backlog & priority queues
│   ├── automation_config.json       # Cron job schedules & enable states
│   ├── pipeline_state.json          # Pipeline status & consecutive failure counts
│   ├── subscribers.json             # Newsletter subscriber records
│   ├── click_log.json               # Raw affiliate click event logs
│   ├── alerts.json                  # System health & crawler alert logs
│   └── token_usage.json             # AI token spend tracker & monthly budget cap
└── public/
    └── manifest.json                # PWA Web App manifest
```

---

## 2. Core Automation Pipelines & Cron Schedule

| Cron Endpoint | Frequency | Purpose |
| :--- | :--- | :--- |
| `/api/pipeline/trend-scout` | Every 6 hours (`0 */6 * * *`) | Scrapes Google Trends RSS, checks 60% dedup, generates drafts, runs QA review. |
| `/api/pipeline/publish` | Every hour (`0 * * * *`) | Releases scheduled articles where `publishAt <= now()`, sends IndexNow search pings. |
| `/api/monitor/cron` | Every hour (`30 * * * *`) | Pings `/news`, `/crypto`, `/finance`, tests DB, checks sitemap, sends Telegram alerts. |
| `/api/content-doctor` | Weekly Mondays (`0 3 * * 1`) | Refreshes articles >60 days old with updated statistics and dates. |
| `/api/report/weekly` | Weekly Sundays (`0 9 * * 0`) | Compiles weekly revenue, published articles, and alert digest to Telegram. |

---

## 3. Mandatory AI Generation & Writing Rules

Any subagent or LLM writing content for this network **must strictly follow these rules**:

1. **Format:** Markdown format starting with `# Title`, followed by:
   * **LLM Answer Box:** 50-word crisp direct answer.
   * **Key Takeaways:** 4–5 bullet points.
   * **Structured H2/H3 Sections:** 1,200–1,500 total words.
   * **Empirical Data / Comparison Table:** Markdown table with features/pricing/data.
   * **Interactive Calculator Placement:** Contextual prompt to use the embedded Next.js calculator.
   * **FAQ Section:** 3–4 high-volume questions for schema capture.
2. **Tone & Anti-Detection:**
   * Strip all AI tropes (`"In conclusion"`, `"In today's fast-paced digital world"`, `"It is important to remember"`).
   * Enforce sentence burstiness (mix 5-word punchy statements with 25-word analytical sentences).
   * Inject first-person practitioner hook at top (`"When our team audited 14 liquidity pools over 90 days..."`).
3. **Ad Density & Layout Guard:**
   * Strictly **≤ 2 ad units per 1,000 words**.
   * Ad units must render in fixed `min-h-[250px]` containers to prevent layout shifts (CLS < 0.05).
