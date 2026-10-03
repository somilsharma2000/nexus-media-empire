# Nexus Media Empire 🚀

> Autonomous AI-powered media network with self-publishing, monetization management, and phone control.

## What This Is

A fully autonomous content business that:
- **Generates** real articles using GPT-4o-mini with AI quality gate
- **Publishes** to 3 niche frontends: News, Crypto, Finance  
- **Monetizes** via AdSense, affiliate links, and direct ads
- **Self-monitors**: uptime, revenue drops, pipeline health
- **Runs on your phone** via Telegram bot (/status, /pause, /resume)

---

## Quick Start (Local)

```bash
npm install
cp .env.example .env
# Fill in .env with your keys (or use the Settings panel in the dashboard)
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (see `.env.example`)
4. Deploy → visit `YOUR_DOMAIN/api/telegram/setup` to activate phone control

---

## Architecture

```
media-empire/
├── app/
│   ├── page.tsx              # Command Center (admin dashboard)
│   ├── news/page.tsx         # The Trend Matrix frontend
│   ├── crypto/page.tsx       # Crypto Daily frontend  
│   ├── finance/page.tsx      # Wall St Insider frontend
│   ├── [niche]/              # Dynamic compliance pages
│   ├── admin/login/          # Auth gate
│   └── api/
│       ├── generate/         # GPT-4o-mini article generation
│       ├── qa-review/        # AI self-reviewer (scores 1-10)
│       ├── pipeline/
│       │   ├── trend-scout/  # Scans Google Trends RSS
│       │   ├── publish/      # Releases scheduled articles
│       │   ├── status/       # Pipeline health board
│       │   └── control/      # Pause/resume steps
│       ├── adslots/          # Ad slot CRUD + kill switch
│       ├── affiliates/       # Affiliate link manager
│       ├── monitor/cron/     # Health checker
│       ├── seo/ping/         # Google Indexing API
│       ├── telegram/webhook/ # Phone control bot
│       ├── content-doctor/   # Weekly article refresh
│       ├── report/weekly/    # Sunday digest
│       └── settings/         # Credential manager
├── components/
│   ├── AdSlotManager.tsx     # Ad slot table + kill switch
│   ├── AffiliateManager.tsx  # Affiliate link tracker
│   ├── RevenueDashboard.tsx  # Real AdSense revenue
│   ├── AlertFeed.tsx         # System health feed
│   ├── PipelineStatus.tsx    # Pipeline control board
│   ├── RisingKeywords.tsx    # SEO keyword opportunities
│   ├── QAConfigPanel.tsx     # AI reviewer thresholds
│   ├── CookieConsent.tsx     # GDPR consent banner
│   └── SettingsPanel.tsx     # Credential manager UI
├── lib/
│   ├── telegram.ts           # sendTelegramAlert() helper
│   └── pipeline-helpers.ts   # Shared pipeline utilities
├── data/                     # JSON file store (seed data)
├── prisma/schema.prisma      # PostgreSQL schema (when DB connected)
├── vercel.json               # Cron job configuration
├── .env.example              # All required env vars documented
└── TELEGRAM_SETUP.md         # Bot setup guide
```

---

## Autonomous Pipeline

```
Every day 8AM UTC:
  Trend Scout → fetches Google Trends RSS (3 niches)
              → dedup check (60% similarity filter)  
              → picks top 2 topics
              → generates articles via GPT-4o-mini
              → AI QA review (score 1-10)
                  ≥ 8 → scheduled for publish
                  5-7 → auto-revision attempt
                  < 5 → rejected, Telegram alert sent

Every day 9AM UTC:
  Publisher → releases all scheduled articles
           → SEO ping to Google Indexing API
           → updates sitemap

Every day noon UTC:
  Monitor → pings all 3 frontends
          → checks article count > 0
          → verifies ads.txt returns 200
          → sends Telegram alert if anything fails

Every Monday 3AM UTC:
  Content Doctor → refreshes articles older than 60 days
                → runs QA gate on updated versions

Every Sunday 9AM UTC:
  Weekly Report → compiles revenue, top articles, alerts
               → sends to Telegram + webhook
```

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Article generation + QA |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL |
| `AUTH_SECRET` | ✅ | Session signing |
| `ADMIN_EMAIL` | ✅ | Dashboard login |
| `ADMIN_PASSWORD_HASH` | ✅ | Dashboard password (bcrypt) |
| `CRON_SECRET` | ✅ | Secures pipeline endpoints |
| `TELEGRAM_BOT_TOKEN` | ⭕ | Phone control |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ⭕ | AdSense publisher ID |
| `MAX_MONTHLY_AI_BUDGET` | ⭕ | Hard cost cap (default $20) |

---

## Revenue Timeline (realistic)

| Month | Goal |
|---|---|
| 1-2 | AdSense approval — write 20-30 real articles |
| 2-3 | First organic traffic — GEO SEO kicks in |
| 3-4 | First $100 from AdSense |
| 4-6 | 50k sessions → apply to Ezoic/Mediavine (3x RPM) |

---

## Phone Commands

After `YOUR_DOMAIN/api/telegram/setup`:

| Command | Action |
|---|---|
| `/status` | Revenue, pipeline state, open alerts |
| `/pause` | Pause all automation |
| `/resume` | Resume all automation |
| `/budget` | AI spend this month |
| `/articles` | Last 5 articles + status |
