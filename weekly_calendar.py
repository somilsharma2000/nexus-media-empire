import os
import sys
import json
from datetime import datetime, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_keywords():
    kw_path = os.path.join(os.path.dirname(__file__), "keywords_hooks.json")
    if os.path.exists(kw_path):
        with open(kw_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "finance": [{"keyword": "debt consolidation loan", "cpc": 5.10, "hook": "The one mistake keeping you in debt forever"}],
        "crypto": [{"keyword": "best hardware wallet 2026", "cpc": 4.10, "hook": "What if I told you your coins aren't safe?"}],
        "insurance": [{"keyword": "term life insurance quotes", "cpc": 4.50, "hook": "What if I told you your premium is 3x too high?"}]
    }

def generate_weekly_calendar():
    niches_data = load_keywords()
    
    days = [
        {"day": "Monday", "focus": "High-Yield Strategy & Deep Dive", "niche": "finance", "trigger": "DEBT20"},
        {"day": "Tuesday", "focus": "Security Protocol & Hardware Review", "niche": "crypto", "trigger": "VAULT"},
        {"day": "Wednesday", "focus": "Cost-Cutting & Premium Audit", "niche": "insurance", "trigger": "QUOTE"},
        {"day": "Thursday", "focus": "Passive Income Blueprint", "niche": "finance", "trigger": "PASSIVE"},
        {"day": "Friday", "focus": "Market Analysis & Weekend Alpha", "niche": "crypto", "trigger": "ALPHA"},
        {"day": "Saturday", "focus": "Family Safety & Asset Protection", "niche": "insurance", "trigger": "SHIELD"},
        {"day": "Sunday", "focus": "Weekly Recap & Monopolization Teardown", "niche": "finance", "trigger": "RECAP"}
    ]
    
    calendar_entries = []
    total_projected_views = 35000  # 5,000 views per day target across network
    total_projected_revenue = 0.0

    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())

    for idx, day_info in enumerate(days):
        date_str = (start_of_week + timedelta(days=idx)).strftime("%Y-%m-%d")
        niche = day_info["niche"]
        kw_list = niches_data.get(niche, [])
        kw_item = kw_list[idx % len(kw_list)] if kw_list else {"keyword": "growth strategy", "cpc": 3.50, "hook": "The contrarian truth"}
        
        cpc = kw_item.get("cpc", 3.0)
        projected_rpm = round(cpc * 11.8, 2)
        daily_est_revenue = round((5000 / 1000) * projected_rpm, 2)
        total_projected_revenue += daily_est_revenue

        entry = {
            "day": day_info["day"],
            "date": date_str,
            "theme": day_info["focus"],
            "niche": niche.upper(),
            "target_keyword": kw_item["keyword"],
            "hook": kw_item["hook"],
            "cpc": f"${cpc:.2f}",
            "projected_rpm": f"${projected_rpm:.2f}/1k views",
            "daily_projected_rev": f"${daily_est_revenue:.2f}",
            "channels": {
                "article": f"1,500+ Word Fact-Checked Guide on '{kw_item['keyword']}'",
                "instagram_carousel": f"10-Slide Visual HTML Carousel (Hook: {kw_item['hook'][:40]}...)",
                "reel_story": "45s 9:16 Video Script + 7-Slide Interactive Story",
                "facebook_authority": "Long-form Teardown + 1st-Comment Shield Link",
                "dm_automation_keyword": day_info["trigger"]
            },
            "commands": {
                "generate_article": f"python antigravity_cli.py",
                "generate_carousel": f"python instagram_post_gen.py \"{kw_item['keyword']}\" {niche}",
                "generate_facebook": f"python facebook_post_gen.py \"{kw_item['keyword']}\" {niche}",
                "generate_reel": f"python story_script_gen.py \"{kw_item['keyword']}\" {niche}",
                "simulate_dm": f"python comment_automation.py \"{day_info['trigger']}\" user_{niche}_01"
            }
        }
        calendar_entries.append(entry)

    # Save Markdown Schedule
    md_output = f"""# 🏛️ HERMES 7-DAY CONTENT ENGINE CALENDAR (100% STANDALONE)
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Projected Weekly Network Reach:** {total_projected_views:,} impressions
**Projected Weekly Ad + Affiliate Revenue:** ${total_projected_revenue:.2f}

---

## 📅 WEEKLY DISTRIBUTION SCHEDULE

| Day | Date | Niche | Focus & Keyword | Est. RPM | DM Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for e in calendar_entries:
        md_output += f"| **{e['day']}** | `{e['date']}` | **{e['niche']}** | {e['target_keyword'].title()} | `{e['projected_rpm']}` | `{e['channels']['dm_automation_keyword']}` |\n"

    md_output += "\n---\n\n## 🛠️ DAY-BY-DAY EXECUTION MATRIX\n\n"

    for e in calendar_entries:
        md_output += f"""### 📌 {e['day'].upper()} — {e['niche']} ({e['date']})
- **Focus:** {e['theme']}
- **Primary Keyword:** `{e['target_keyword']}` (CPC: {e['cpc']} | RPM: {e['projected_rpm']})
- **Viral Hook:** *"{e['hook']}"*
- **DM Keyword Trigger:** `{e['channels']['dm_automation_keyword']}`
- **Channel Deliverables:**
  - 📝 **Article:** {e['channels']['article']}
  - 📸 **Instagram:** {e['channels']['instagram_carousel']}
  - 🎬 **Video/Story:** {e['channels']['reel_story']}
  - 📘 **Facebook:** {e['channels']['facebook_authority']}

```bash
# Instant Hermes CLI Commands for {e['day']}:
{e['commands']['generate_carousel']}
{e['commands']['generate_facebook']}
{e['commands']['generate_reel']}
{e['commands']['simulate_dm']}
```

---
"""

    md_output_path = os.path.join(os.path.dirname(__file__), "weekly_schedule.md")
    json_output_path = os.path.join(os.path.dirname(__file__), "weekly_schedule.json")

    with open(md_output_path, "w", encoding="utf-8") as f:
        f.write(md_output)

    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(calendar_entries, f, indent=2)

    print(f"\n✅ [HERMES] 7-Day Content Calendar successfully generated!")
    print(f"📄 Markdown: {md_output_path}")
    print(f"📊 JSON: {json_output_path}")
    print(f"💰 Projected Weekly Run-Rate: ${total_projected_revenue:.2f} (AdSense + CPA Offers)")

if __name__ == "__main__":
    generate_weekly_calendar()
