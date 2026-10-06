"""
Hermes Standalone 45s Reel & 7-Slide Story Script Generator
Generates high-retention 9:16 vertical video & story scripts locally.
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(PROJECT_DIR, "social_output", "stories")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_story_script(title, niche, hook):
    script = f"""🎬 HERMES 45-SECOND VIRAL REEL / 7-SLIDE STORY SCRIPT

Topic: {title}
Niche: {niche.upper()}

----------------------------------------------------------------------
TIMING & SPOKEN SCRIPT:
----------------------------------------------------------------------
[00:00 - 00:03] THE HOOK (Look directly at camera, high energy):
"{hook}"

[00:03 - 00:15] SLIDE 2 & 3 (The Breakdown):
"Most people approach this with outdated assumptions. When we ran the numbers, we saw that execution friction dropped by more than 60% when you use structured frameworks."

[00:15 - 00:30] SLIDE 4 & 5 (The Proof & Core Pillar):
"Here are the 3 non-negotiables: First, automate verification. Second, eliminate single-point dependencies. Third, layer intent-matched monetization."

[00:30 - 00:45] SLIDE 6 & 7 (The Follow-Gated Call to Action):
"I just published the full 1,500-word deep dive with all data tables. Drop a comment below saying 'ACCESS' and make sure you follow us—our bot will DM you the direct un-gated link instantly!"

----------------------------------------------------------------------
ON-SCREEN TEXT OVERLAYS:
----------------------------------------------------------------------
1. {title[:40]}
2. 3 Non-Negotiable Findings
3. Latency Compressed by 64%
4. Comment Below for Un-gated Link (Follow to unlock)

AUDIO RECOMMENDATION: Deep Focus Lo-Fi / High-Energy Phonk
"""
    return script

def main():
    print("=" * 65)
    print("📸 HERMES STANDALONE 45s REEL & STORY SCRIPT GENERATOR")
    print("=" * 65)
    
    title = "Why Term Life Insurance Is the Ultimate Asset Shield"
    niche = "insurance"
    hook = "Do not sign an insurance policy before reading this 2-minute breakdown."
    
    script = generate_story_script(title, niche, hook)
    
    file_path = os.path.join(OUTPUT_DIR, "insurance_term_life_script.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(script)
        
    print(f"✅ Generated Standalone Story / Reel Script: {file_path}")
    print("=" * 65)

if __name__ == "__main__":
    main()
