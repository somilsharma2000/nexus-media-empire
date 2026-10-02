# Telegram Bot Setup Guide

## Step 1 — Create your bot
1. Open Telegram, search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the **token** you receive

## Step 2 — Get your Telegram User ID
1. Search for **@userinfobot** on Telegram
2. Start the bot — it will reply with your numeric User ID

## Step 3 — Add to .env
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_USER_ID=your_numeric_user_id_here
```

## Step 4 — Register the Webhook
After deploying to Vercel, visit:
```
https://YOUR_DOMAIN/api/telegram/setup
```

## Step 5 — Test
Send `/status` to your bot. You should receive a live status report.

## Available Commands
| Command | Action |
|---|---|
| `/status` | Full system status: revenue, pipeline, alerts |
| `/pause` | Pause all pipeline steps immediately |
| `/resume` | Resume all pipeline steps |
| `/budget` | Current month AI token spend + remaining |
| `/articles` | Last 5 articles with status |

## Inline Actions (from QA alerts)
When the AI QA gate rejects an article, the bot sends you a message with inline buttons:
- **APPROVE** — schedules the article for publishing
- **REVISE** — re-runs QA with revision instructions
- **REJECT** — marks the article as rejected

## Security
The bot is locked to your `TELEGRAM_ADMIN_USER_ID` — any other user gets silently ignored.
