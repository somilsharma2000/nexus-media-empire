# Telegram Bot Setup

## Quick Start

1. **Create your bot** — Message [@BotFather](https://t.me/BotFather) on Telegram, send `/newbot` and follow the prompts.
2. **Copy the token** — Paste it into `TELEGRAM_BOT_TOKEN` in your `.env` file.
3. **Find your user ID** — Message [@userinfobot](https://t.me/userinfobot); copy your numeric ID into `TELEGRAM_ADMIN_USER_ID`.
4. **Deploy to Vercel** (or start locally with `npm run dev`).
5. **Register the webhook** — Visit:
   ```
   YOUR_DOMAIN/api/telegram/setup
   ```
   You should see `{ "success": true, "webhookUrl": "..." }`.
6. **Test it** — Send `/status` to your bot on Telegram.

---

## Available Commands

| Command | Description |
|---|---|
| `/status` | Full pipeline status — revenue, alerts, article counts |
| `/pause` | Pause all pipeline steps |
| `/resume` | Resume the pipeline |
| `/budget` | Show current month token spend and budget |
| `/articles` | List the last 5 articles with their status |
| `/approve_{id}` | Approve an article → status set to `scheduled` |
| `/reject_{id}` | Reject an article → status set to `rejected` |
| `/revise_{id}` | Re-run QA review for an article |

---

## Automatic Alerts

The bot will automatically message you when:

- 🚨 **Critical monitor alerts** fire (site down, API unavailable)
- 🚨 **QA rejects** an article — includes inline `/approve_` and `/reject_` shortcuts

---

## Security

Every incoming message is checked against `TELEGRAM_ADMIN_USER_ID`.  
Any message from an unknown sender is rejected with `Unauthorized`.

---

## Environment Variables

```bash
TELEGRAM_BOT_TOKEN=         # from @BotFather
TELEGRAM_ADMIN_USER_ID=     # your numeric Telegram user ID
NEXT_PUBLIC_SITE_URL=       # your deployed domain, e.g. https://nexus.vercel.app
```
