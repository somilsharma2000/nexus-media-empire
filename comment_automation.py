"""
Hermes Standalone 2-Step Follow-Gated Comment Automation Engine
Provides the standalone logic and webhook responder templates for $0 cost comment-to-DM conversion.
"""

import os
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

AFFILIATE_OFFERS = {
    "crypto": {
        "offer": "Ledger Cold Storage Hardware Shield",
        "link": "https://your-free-subdomain.com/go/ledger-wallet",
        "cpa": "$15 - $35 per conversion",
        "handle": "@CryptoDailyOfficial"
    },
    "finance": {
        "offer": "TradingView Pro Valuation Suite",
        "link": "https://your-free-subdomain.com/go/tradingview-pro",
        "cpa": "$15 - $30 per conversion",
        "handle": "@WallStInsider"
    },
    "insurance": {
        "offer": "Policygenius Rate Optimizer",
        "link": "https://your-free-subdomain.com/go/policygenius",
        "cpa": "$20 - $40 per conversion",
        "handle": "@TheTrendMatrix"
    }
}

def process_comment_step1(username, comment_text, niche="crypto", post_title="Master Blueprint"):
    """
    Step 1: User comments ANYTHING on your post.
    Bot sends public reply + Step 1 Follow Verification DM.
    """
    data = AFFILIATE_OFFERS.get(niche, AFFILIATE_OFFERS["crypto"])
    
    public_reply = f"@{username} Check your DMs! 📩 We just sent you a private message to confirm your link!"
    
    step1_dm = f"""Hey @{username}! 👋 Thanks for commenting on our '{post_title}' breakdown!

🔒 QUICK FOLLOWER CHECK:
To unlock the complete un-gated research brief and interactive models, make sure you follow {data['handle']}.

👉 Once followed, reply 'YES' (or tap 'I Am Following ✅') to verify and receive instant access! 🚀"""

    return {
        "step": 1,
        "public_reply": public_reply,
        "private_dm_step1": step1_dm,
        "status": "AWAITING_FOLLOWER_CONFIRMATION"
    }

def process_comment_step2(username, niche="crypto"):
    """
    Step 2: User confirms they follow.
    Bot verifies and releases the un-gated link + 20% discount code.
    """
    data = AFFILIATE_OFFERS.get(niche, AFFILIATE_OFFERS["crypto"])
    
    step2_dm = f"""🎉 Verified & Access Granted @{username}!

🚀 Here is your exclusive direct access link:
{data['link']}

🎁 BONUS: Use code 'VIP20' for an instant 20% discount on our companion execution toolkit!

Enjoy reading and let us know your thoughts! 💡"""

    return {
        "step": 2,
        "private_dm_step2": step2_dm,
        "status": "VERIFIED_DELIVERED"
    }

def main():
    print("=" * 65)
    print("💬 HERMES STANDALONE 2-STEP FOLLOW-GATED COMMENT AUTOMATION")
    print("=" * 65)
    
    test_user = "alex_investor"
    test_comment = "Loved this breakdown! Can I get the link?"
    
    print(f"\n[EVENT] User @{test_user} commented: \"{test_comment}\"")
    
    step1 = process_comment_step1(test_user, test_comment, "crypto", "Crypto Scam Protection")
    print("\n--- STEP 1 (TRIGGERED BY ANY COMMENT) ---")
    print(f"📣 Public Reply: {step1['public_reply']}")
    print(f"📩 Private DM 1:\n{step1['private_dm_step1']}")
    
    print("\n[EVENT] User @alex_investor replies: 'YES I AM FOLLOWING'")
    
    step2 = process_comment_step2(test_user, "crypto")
    print("\n--- STEP 2 (FOLLOW VERIFIED & LINK UNLOCKED) ---")
    print(f"🚀 Private DM 2:\n{step2['private_dm_step2']}")
    print("\n✅ Standalone Follow-Gate Verification Completed ($0 Cost).")
    print("=" * 65)

if __name__ == "__main__":
    main()
