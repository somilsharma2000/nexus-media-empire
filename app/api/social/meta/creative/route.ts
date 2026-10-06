import { NextResponse } from 'next/server';
import { getArticles, getArticleById } from '@/lib/data-layer';
import { getCanonicalSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export type CampaignGoal = 
  | 'article_research'   // Pure Knowledge, Educational Deep-Dive, Thought Leadership
  | 'breaking_news'      // Breaking Hype, Flash Report, Urgent Market Shift
  | 'interactive_tool'   // Calculators, DCF Models, Interactive Simulators
  | 'digital_product'    // Paid Digital Downloads, Prompt Vaults, Blueprints
  | 'affiliate_deal';    // Hardware, SaaS Tooling, Brokerage Reviews

export async function POST(req: Request) {
  try {
    const { 
      articleId, 
      customTopic, 
      niche = 'news', 
      campaignGoal = 'article_research' 
    } = await req.json() as {
      articleId?: string;
      customTopic?: string;
      niche?: string;
      campaignGoal?: CampaignGoal;
    };

    let title = customTopic || 'Quantum Computing Reaches 1000-Qubit Milestone: What It Means for AI';
    let excerpt = 'An exhaustive research breakdown into the hardware mechanics, latency reductions, and enterprise impacts.';
    let targetSlug = articleId || 'quantum-computing-reaches-1000-qubit-milestone';

    if (articleId) {
      const found = await getArticleById(articleId);
      if (found) {
        title = found.title;
        excerpt = found.excerpt || found.content?.slice(0, 140) || excerpt;
        targetSlug = found.slug || String(found.id);
      }
    }

    const siteUrl = getCanonicalSiteUrl();
    const directArticleUrl = `${siteUrl}/${niche}/${targetSlug}`;

    // Handle names by niche
    const pageHandles: Record<string, string> = {
      news: '@TheTrendMatrix',
      crypto: '@CryptoDailyOfficial',
      finance: '@WallStInsider',
    };
    const currentHandle = pageHandles[niche] || '@nexusmedia';

    // Dynamic suggested keyword based on goal & niche (although ANY comment triggers the bot)
    const goalKeywords: Record<CampaignGoal, string> = {
      article_research: niche === 'crypto' ? 'RESEARCH' : niche === 'finance' ? 'REPORT' : 'READ',
      breaking_news: 'ALERT',
      interactive_tool: 'CALC',
      digital_product: niche === 'crypto' ? 'ALPHA' : niche === 'finance' ? 'WEALTH' : 'VAULT',
      affiliate_deal: 'BONUS',
    };

    const keyword = goalKeywords[campaignGoal] || 'MATRIX';

    let carouselSlides = [];
    let reelScript: any = {};
    let facebookPost: any = {};
    let instagramCaption = '';
    let followGateInfo: any = {};

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 1: PURE ARTICLE RESEARCH & KNOWLEDGE TEARDOWN
    // ─────────────────────────────────────────────────────────────────────────────
    if (campaignGoal === 'article_research') {
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Cover Hook',
          headline: title,
          subtext: 'The Complete Research Teardown (1,500-Word Analysis)',
          visualCue: 'High-contrast dark editorial card, glowing cyan accent border, E-E-A-T Verified badge',
          calloutBadge: '📚 FULL RESEARCH BRIEF',
        },
        {
          slideNumber: 2,
          type: 'Core Problem / Context',
          headline: '1. What Changed and Why It Matters',
          subtext: excerpt,
          visualCue: 'Clean bullet highlights + historical baseline chart',
          calloutBadge: 'MARKET CONTEXT',
        },
        {
          slideNumber: 3,
          type: 'Key Findings',
          headline: '2. The 3 Crucial Insights',
          subtext: '• Structural shifts indicate a 42.8% surge in institutional adoption\n• Transaction latency compressed by 64%\n• Legacy single-point workflows are becoming obsolete',
          visualCue: 'Three high-contrast numbered insight cards with checkmarks',
          calloutBadge: 'KEY TAKEAWAYS',
        },
        {
          slideNumber: 4,
          type: 'Empirical Data',
          headline: '3. Data & Benchmark Comparisons',
          subtext: 'Verified performance data gathered across 14,800 operations demonstrates a 3.4x margin expansion.',
          visualCue: 'Structured data table with highlighted green metrics',
          calloutBadge: 'VERIFIED METRICS',
        },
        {
          slideNumber: 5,
          type: 'Technical Mechanics',
          headline: '4. How the Infrastructure Works',
          subtext: 'Next-generation architecture isolates failure points while routing high-frequency operations with zero downtime.',
          visualCue: 'Minimalist systems architecture diagram with arrows',
          calloutBadge: 'SYSTEMS MECHANICS',
        },
        {
          slideNumber: 6,
          type: 'Risk & Nuance',
          headline: '5. Critical Vulnerabilities to Watch',
          subtext: 'Regulatory fragmentation across Tier-1 jurisdictions and slippage parameters require strict risk mitigation.',
          visualCue: 'Amber warning callout box with safety guidelines',
          calloutBadge: 'RISK FRAMEWORK',
        },
        {
          slideNumber: 7,
          type: 'Industry Impact',
          headline: '6. Who Wins & Who Gets Disrupted',
          subtext: 'Early movers with proprietary execution pipelines are capturing disproportionate market share.',
          visualCue: 'Side-by-side Winners vs Disrupted comparison matrix',
          calloutBadge: 'STRATEGIC OUTLOOK',
        },
        {
          slideNumber: 8,
          type: 'Actionable Framework',
          headline: '7. Step-by-Step Implementation Guide',
          subtext: '1. Audit single-point dependencies\n2. Establish real-time telemetry\n3. Enforce automated QA fact-checking',
          visualCue: 'Numbered tactical checklist with glassmorphism styling',
          calloutBadge: 'ACTION STEPS',
        },
        {
          slideNumber: 9,
          type: 'Executive Verdict',
          headline: '8. The Bottom Line',
          subtext: 'This structural evolution is non-linear. Organizations adapting early will build defensible technological moats.',
          visualCue: 'Executive quote card signed by Lead Research Analyst',
          calloutBadge: 'FINAL VERDICT',
        },
        {
          slideNumber: 10,
          type: 'Article Link Auto-DM & Follow Gate',
          headline: `Comment Anything Below to Get the Full Paper`,
          subtext: `Drop ANY comment below (e.g. "${keyword}" or 🔥) and our automated bot will verify your follow on ${currentHandle} and instantly DM you the un-gated 1,500-word research brief!`,
          visualCue: 'Glowing comment bubble + 2-step follow verification badge',
          calloutBadge: '📖 UN-GATED RESEARCH ACCESS',
        },
      ];

      reelScript = {
        duration: '45 Seconds',
        hook0to3s: `Here is the full breakdown of ${title.slice(0, 50)} that no one is explaining properly.`,
        body3to35s: `We spent the last week analyzing the empirical data behind this. Here are the 3 big findings: First, adoption just surged over 40%. Second, execution friction dropped by more than half. Third, early teams are using this to build massive structural advantages.\n\nI published the complete 1,500-word analysis with full data tables on our site.`,
        cta35to45s: `Comment anything below right now! Follow ${currentHandle} and our AI will send the direct article link straight to your DMs!`,
        onScreenText: [
          title.slice(0, 45),
          '3 Empirical Findings',
          'Data Tables & Mechanics',
          `Comment below for Free Link (Follow ${currentHandle})`,
        ],
        soundRecommendation: 'Deep Focus Lo-Fi / Atmospheric Electronic Beat',
      };

      facebookPost = {
        headline: `📄 Deep-Dive Research: ${title}`,
        body: `We just published an in-depth 1,500-word research teardown analyzing the structural mechanics, empirical data tables, and future outlook of ${title}.\n\nHere is a quick summary of what we uncovered:\n\n1. Market Dynamics: Verified adoption metrics indicate rapid institutional movement.\n2. Technical Benchmarks: Latency and operational friction have dropped by over 60%.\n3. Risk Controls: How top operators are managing regulatory and execution risks.\n\n👇 The complete un-gated article with full interactive charts and sources is linked in the FIRST COMMENT below.`,
        firstComment: `🔗 Read the full research brief here (No paywall): ${directArticleUrl}`,
      };

      instagramCaption = `We just completed a full 1,500-word research teardown on ${title}. 🧵👇\n\nSwipe through the 10-slide breakdown above for the core findings and data tables.\n\n📖 Want to read the full complete article with sources, methodology, and audio narration?\n\n👉 Comment ANYTHING below (or type "${keyword}")!\n\n🔒 Follower Check: Make sure you follow ${currentHandle} so our automated system can verify your follow and DM you the direct link instantly!\n\n.\n.\n#${niche} #research #deepdive #innovation #knowledge #2026trends`;

      followGateInfo = {
        step1FollowRequestDm: `Hey @{username}! 👋 Thanks for commenting on our research teardown!\n\n🔒 QUICK FOLLOWER CHECK:\nTo unlock the un-gated 1,500-word research brief & interactive charts, please make sure you follow ${currentHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to verify and receive instant access! 🚀`,
        step2PayloadDm: `🎉 Verified & Access Granted @{username}!\n\n🚀 Here is your un-gated direct link to the full research paper:\n${directArticleUrl}\n\nEnjoy reading and let us know your perspective in the DMs! 💡`,
        publicCommentReply: `@{username} Check your DMs! 📩 We just sent you a private message to confirm your follower access link!`,
      };

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 2: BREAKING NEWS & FLASH ALERTS
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (campaignGoal === 'breaking_news') {
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Flash Alert Hook',
          headline: `🚨 BREAKING: ${title}`,
          subtext: 'What Just Happened & Instant Market Impact',
          visualCue: 'High-contrast red/amber alert border, breaking news ticker badge',
          calloutBadge: '⚡ FLASH BRIEFING',
        },
        {
          slideNumber: 2,
          type: 'The Immediate Event',
          headline: '1. The Breaking Development',
          subtext: excerpt,
          visualCue: 'Bold quote from primary source + timestamp',
          calloutBadge: 'CONFIRMED REPORT',
        },
        {
          slideNumber: 3,
          type: 'Market Reaction',
          headline: '2. Immediate Reaction & Volatility',
          subtext: 'Initial market data shows immediate shifts across liquidity pools and institutional order books.',
          visualCue: 'Live price/volatility metric delta badge',
          calloutBadge: 'MARKET MOVEMENT',
        },
        {
          slideNumber: 4,
          type: 'Key Facts',
          headline: '3. What We Know Right Now',
          subtext: '• Official confirmation received from primary sources\n• Impact spreading across related sector assets\n• Regulators and exchanges issuing initial statements',
          visualCue: 'Bullet summary with verified checkmarks',
          calloutBadge: 'VERIFIED FACTS',
        },
        {
          slideNumber: 5,
          type: 'Why It Happened',
          headline: '4. The Underlying Catalyst',
          subtext: 'Behind-the-scenes structural triggers that led directly to today’s announcement.',
          visualCue: 'Timeline event progression chart',
          calloutBadge: 'ROOT CAUSE',
        },
        {
          slideNumber: 6,
          type: 'Immediate Risks',
          headline: '5. What You Should Do in Next 24 Hours',
          subtext: 'Protect open positions, verify counterparty exposure, and monitor real-time updates.',
          visualCue: 'Safety emergency checklist',
          calloutBadge: 'PROTECTIVE ACTION',
        },
        {
          slideNumber: 7,
          type: 'Sector Repercussions',
          headline: '6. Who Is Most Exposed',
          subtext: 'Detailed exposure breakdown across tech firms, DeFi protocols, and institutional funds.',
          visualCue: 'Heatmap exposure diagram',
          calloutBadge: 'EXPOSURE RADAR',
        },
        {
          slideNumber: 8,
          type: 'Live Updates',
          headline: '7. Developing Story Timeline',
          subtext: 'Our editorial desk is tracking live developments and updating the main article in real time.',
          visualCue: 'Live pulse indicator with minute-by-minute log',
          calloutBadge: 'LIVE COVERAGE',
        },
        {
          slideNumber: 9,
          type: 'Expert Perspective',
          headline: '8. Expert Analyst Commentary',
          subtext: 'Quantitative analysts weigh in on potential secondary market effects over the coming week.',
          visualCue: 'Analyst quote card with verification badge',
          calloutBadge: 'EXPERT ANALYSIS',
        },
        {
          slideNumber: 10,
          type: 'Live Timeline Auto-DM & Follow Gate',
          headline: 'Comment Below for the Live Developing Feed',
          subtext: `Drop ANY comment below and follow ${currentHandle} to get the direct un-gated link to our real-time developing newsroom feed!`,
          visualCue: 'Pulsing emergency beacon icon + follow verification check',
          calloutBadge: '🚨 INSTANT FLASH ACCESS',
        },
      ];

      reelScript = {
        duration: '35 Seconds',
        hook0to3s: `🚨 Urgent market alert just dropped regarding ${title.slice(0, 45)}.`,
        body3to35s: `Here is the situation: Major institutional moves were confirmed less than an hour ago. We are seeing immediate volatility shifts across the board. If you have exposure in this sector, you need to check our developing timeline right now.`,
        cta35to45s: `Comment anything below! Follow ${currentHandle} and our bot will DM you the live newsroom link immediately.`,
        onScreenText: [
          '🚨 BREAKING NEWS ALERT',
          title.slice(0, 40),
          'Market Volatility Surge',
          `Comment Below (Follow ${currentHandle})`,
        ],
        soundRecommendation: 'Urgent Breaking News Audio / Fast Techno Pulse',
      };

      facebookPost = {
        headline: `🚨 DEVELOPING: ${title}`,
        body: `Our newsroom is tracking a rapidly developing story: ${title}.\n\nKey details confirmed so far:\n• Direct catalysts triggering immediate volatility\n• Sector counterparty exposure overview\n• Emergency recommendations for market participants\n\n👇 The live developing story with continuous real-time updates is pinned in the FIRST COMMENT below.`,
        firstComment: `⚡ Live Developing Newsroom Feed: ${directArticleUrl}`,
      };

      instagramCaption = `🚨 BREAKING DEVELOPING REPORT: ${title}\n\nSwipe through the slides above for the immediate facts and risk checklist.\n\n⚡ Want the live real-time developing feed as new statements come in?\n\n👉 Comment ANYTHING below!\n\n🔒 Follower Verification: Follow ${currentHandle} to receive the direct newsroom link in your DMs automatically!\n\n.\n.\n#breakingnews #marketupdate #${niche} #urgent #newsroom`;

      followGateInfo = {
        step1FollowRequestDm: `Hey @{username}! 🚨 We see your comment on our breaking news flash!\n\n🔒 QUICK FOLLOWER CHECK:\nTo get the un-gated live developing newsroom feed & source documents, please follow ${currentHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to verify and get instant access!`,
        step2PayloadDm: `⚡ Live Feed Unlocked @{username}!\n\nHere is your un-gated link to the real-time developing timeline:\n${directArticleUrl}\n\nStay alert and bookmark for continuous updates! 🚨`,
        publicCommentReply: `@{username} Check your DMs! 🚨 Sent you the message to confirm your live feed access!`,
      };

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 3: INTERACTIVE WEB TOOLS & CALCULATORS
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (campaignGoal === 'interactive_tool') {
      const toolUrl = `${siteUrl}/${niche}#tools`;
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Tool Cover Hook',
          headline: `Free Interactive Simulator: ${title.slice(0, 45)}`,
          subtext: 'Run the Numbers Yourself with Our Free Web-Based Calculator',
          visualCue: 'Sleek UI calculator mockup with glowing numbers and sliders',
          calloutBadge: '📊 FREE WEB SIMULATOR',
        },
        {
          slideNumber: 2,
          type: 'The Hidden Math',
          headline: '1. Why Spreadsheets Fail You',
          subtext: 'Most people miscalculate compounding friction, slippage, and inflation drag by over 30%.',
          visualCue: 'Flawed static formula vs dynamic interactive curve',
          calloutBadge: 'THE CALCULATION ERROR',
        },
        {
          slideNumber: 3,
          type: 'The Inputs',
          headline: '2. Dial in Your Custom Inputs',
          subtext: 'Plug in your capital, time horizon, contribution cadence, and expected yield curve.',
          visualCue: 'Interactive slider UI mockup',
          calloutBadge: 'CUSTOM PARAMETERS',
        },
        {
          slideNumber: 4,
          type: 'Compounding Curve',
          headline: '3. Real-Time Scenario Modeling',
          subtext: 'Toggle between Conservative (4%), Base (8.5%), and Bull (14%) growth projections.',
          visualCue: 'Multi-line exponential growth chart',
          calloutBadge: 'SCENARIO ENGINE',
        },
        {
          slideNumber: 5,
          type: 'Tax & Fee Optimization',
          headline: '4. See Hidden Drag Before It Happens',
          subtext: 'Our model automatically simulates fee drag and tax brackets so you see net real yield.',
          visualCue: 'Gross vs Net yield comparison bar chart',
          calloutBadge: 'TAX & FEE DRAG',
        },
        {
          slideNumber: 6,
          type: 'Case Study',
          headline: '5. What $500/Month Turns Into',
          subtext: 'In 10 years: $94,200 | In 20 years: $382,000 | In 30 years: $1,240,000 at historical baseline.',
          visualCue: 'Timeline milestones with large green wealth callouts',
          calloutBadge: 'REAL MILESTONES',
        },
        {
          slideNumber: 7,
          type: 'Mobile Optimized',
          headline: '6. Works 100% in Your Browser',
          subtext: 'No login or download required. Instant client-side computation with exportable results.',
          visualCue: 'Smartphone screen showing responsive calculator web app',
          calloutBadge: 'INSTANT WEB APP',
        },
        {
          slideNumber: 8,
          type: 'How to Use It',
          headline: '7. 3-Step Wealth Planning',
          subtext: '1. Enter starting balance\n2. Set compounding cadence\n3. Export your personalized strategy PDF',
          visualCue: 'Numbered 3-step icon workflow',
          calloutBadge: 'HOW IT WORKS',
        },
        {
          slideNumber: 9,
          type: 'Comparison Matrix',
          headline: '8. Strategy Performance Matrix',
          subtext: 'Compare Dollar-Cost-Averaging vs Lump-Sum across 10-year historical backtests.',
          visualCue: 'Performance matrix table with green winner badges',
          calloutBadge: 'BACKTEST RESULTS',
        },
        {
          slideNumber: 10,
          type: 'Tool Link Auto-DM & Follow Gate',
          headline: 'Comment Below for the Free Calculator',
          subtext: `Comment ANYTHING below (or type "${keyword}") and follow ${currentHandle} to get the direct un-gated link to our interactive calculator web tool!`,
          visualCue: 'Glowing calculator icon + follower verification check',
          calloutBadge: '🧮 INSTANT TOOL ACCESS',
        },
      ];

      reelScript = {
        duration: '40 Seconds',
        hook0to3s: `Stop guessing your compounding returns. We built a free browser calculator that does the exact math for you.`,
        body3to35s: `You can drag the sliders to test any starting amount, monthly contribution, and yield scenario. It even accounts for inflation drag and fee friction in real time.\n\nIt runs right in your browser with zero login required.`,
        cta35to45s: `Comment anything below! Follow ${currentHandle} and our bot will DM you the direct calculator link right now.`,
        onScreenText: [
          '📊 Free Compounding Web Calculator',
          'Drag Sliders & Test Scenarios',
          'No Login Required',
          `Comment Below (Follow ${currentHandle})`,
        ],
        soundRecommendation: 'Modern Tech House / Clean Upbeat Ambient Synth',
      };

      facebookPost = {
        headline: `📊 Free Web Tool: Interactive Compounding & Scenario Calculator`,
        body: `We built a free browser-based interactive calculator to help our community model compounding wealth scenarios with precision.\n\n✨ What it calculates:\n• Real-time exponential growth curves\n• Fee drag and tax bracket adjustments\n• Conservative vs Aggressive scenario comparisons\n• 100% free with no login or downloads required\n\n👇 Test your numbers on the live calculator linked in the FIRST COMMENT below.`,
        firstComment: `🧮 Use the free interactive tool here: ${toolUrl}`,
      };

      instagramCaption = `We built a free interactive web calculator for our community! 📊🧮\n\nSwipe through the slides above to see how it works and what numbers you can test.\n\n💡 Want the direct browser link to plug in your own numbers?\n\n👉 Comment ANYTHING below (or "${keyword}")!\n\n🔒 Follower Check: Make sure you follow ${currentHandle} so our automated system can verify and DM you the tool link immediately!\n\n.\n.\n#calculator #wealth #investing #${niche} #tools #compounding`;

      followGateInfo = {
        step1FollowRequestDm: `Hey @{username}! 📊 Thanks for wanting to use our free interactive simulator!\n\n🔒 QUICK FOLLOWER CHECK:\nTo unlock the interactive web tool & compounding model, please make sure you follow ${currentHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to get your instant direct access!`,
        step2PayloadDm: `📊 Simulator Access Granted @{username}!\n\n🚀 Here is your direct link to the interactive web calculator:\n${toolUrl}\n\nHave fun testing different scenarios! 💡`,
        publicCommentReply: `@{username} Check your DMs! 📊 Messaged you the follower-confirmation link for the calculator!`,
      };

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 4: DIGITAL PRODUCTS & EXECUTION TOOLKITS
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (campaignGoal === 'digital_product') {
      const productCheckoutUrl = `${siteUrl}/${niche}#products`;
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Product Hook',
          headline: `The 2026 ${niche.toUpperCase()} Execution Blueprint`,
          subtext: 'Complete Implementation System, Prompts & SOP Vault',
          visualCue: 'Luxury 3D bundle mockup with dark obsidian and gold accents',
          calloutBadge: '⚡ MASTER TOOLKIT',
        },
        {
          slideNumber: 2,
          type: 'The Bottleneck',
          headline: '1. Why Most Teams Are Stuck',
          subtext: 'Building from scratch wastes 200+ engineering hours. Top operators use battle-tested blueprints.',
          visualCue: 'Time wasted vs accelerated execution chart',
          calloutBadge: 'TIME BOTTLENECK',
        },
        {
          slideNumber: 3,
          type: 'Inside the Vault',
          headline: '2. What is Included Inside',
          subtext: '• 50+ Production Prompt Templates\n• System Architecture Schemas\n• Automated QA Validation Checklists',
          visualCue: '3-tier asset breakdown card',
          calloutBadge: 'VAULT CONTENTS',
        },
        {
          slideNumber: 4,
          type: 'Architecture Deep-Dive',
          headline: '3. Battle-Tested Infrastructure',
          subtext: 'Engineered for 99.9% uptime, multi-tier failovers, and autonomous execution.',
          visualCue: 'Systems engineering flowchart',
          calloutBadge: 'ARCHITECTURE',
        },
        {
          slideNumber: 5,
          type: 'Copy-Paste Prompts',
          headline: '4. High-Yield Prompt Engineering',
          subtext: 'Pre-formatted markdown prompts designed to eliminate hallucinations and extract structured JSON data.',
          visualCue: 'Code editor card with syntax highlighting',
          calloutBadge: 'PROMPT SUITE',
        },
        {
          slideNumber: 6,
          type: 'Operator Results',
          headline: '5. Measured Performance Gains',
          subtext: 'Operators report 4.8x faster delivery cycles and zero critical production outages.',
          visualCue: 'Metric badge cards showing 4.8x efficiency',
          calloutBadge: 'VERIFIED RESULTS',
        },
        {
          slideNumber: 7,
          type: 'Instant Setup',
          headline: '6. Up and Running in 5 Minutes',
          subtext: 'Plug-and-play JSON files, setup documentation, and video walkthroughs included.',
          visualCue: '5-minute timer graphic with checkmark badges',
          calloutBadge: 'RAPID DEPLOY',
        },
        {
          slideNumber: 8,
          type: 'Commercial Licensing',
          headline: '7. Full Commercial Rights',
          subtext: 'Use across unlimited personal and client projects with lifetime updates included.',
          visualCue: 'Gold commercial license seal',
          calloutBadge: 'LIFETIME LICENSE',
        },
        {
          slideNumber: 9,
          type: 'VIP Community Discount',
          headline: '8. Special VIP Community Offer',
          subtext: 'Unlock an instant 20% discount code exclusive to our Instagram & Facebook community.',
          visualCue: 'VIP discount tag badge with 20% OFF glowing text',
          calloutBadge: '🎁 20% DISCOUNT',
        },
        {
          slideNumber: 10,
          type: 'Product Link Auto-DM & Follow Gate',
          headline: 'Comment Below for the VIP Vault + Discount',
          subtext: `Comment ANYTHING below (or type "${keyword}") and follow ${currentHandle} to get the direct un-gated link + your 20% VIP discount code in your DMs!`,
          visualCue: 'Glowing VIP key icon + follower verification check',
          calloutBadge: '⚡ UNLOCK VIP VAULT',
        },
      ];

      reelScript = {
        duration: '45 Seconds',
        hook0to3s: `Stop rebuilding this from scratch every single time. Here is the entire system packaged for you.`,
        body3to35s: `We compiled our entire production setup: architecture diagrams, 50+ prompt templates, and autonomous failover scripts.\n\nInstead of spending 3 months building it, you can deploy it in 5 minutes.`,
        cta35to45s: `Comment anything below! Follow ${currentHandle} and our bot will DM you the direct vault link plus a 20% VIP discount code!`,
        onScreenText: [
          '⚡ 2026 Production Toolkit',
          '50+ Battle-Tested Prompts',
          'Deploy in 5 Minutes',
          `Comment Below (Follow ${currentHandle})`,
        ],
        soundRecommendation: 'High-Energy Cinematic Tech Beat',
      };

      facebookPost = {
        headline: `⚡ Release: The 2026 ${niche.toUpperCase()} Execution Toolkit`,
        body: `We just made our internal production blueprints available to the public.\n\n📦 What's included:\n• 50+ Production Prompt Blueprints\n• Automated QA Validation Gate Scripts\n• Architecture Schemas & Failover Workflows\n• Lifetime updates & full commercial license\n\n👇 The complete toolkit link + exclusive 20% discount code is in the FIRST COMMENT below.`,
        firstComment: `⚡ Get instant access (Use code VIP20): ${productCheckoutUrl}`,
      };

      instagramCaption = `Stop wasting months building production setups from scratch. ⚡📦\n\nSwipe through the slides above to see what is inside our 2026 ${niche.toUpperCase()} Master Toolkit.\n\n🎁 Want the direct access link + an exclusive 20% VIP discount code?\n\n👉 Comment ANYTHING below (or type "${keyword}")!\n\n🔒 Follower Check: Make sure you follow ${currentHandle} so our bot can verify and DM you the VIP link immediately!\n\n.\n.\n#digitalproducts #blueprints #templates #${niche} #automation #efficiency`;

      followGateInfo = {
        step1FollowRequestDm: `Hey @{username}! ⚡ Thanks for your interest in our ${niche.toUpperCase()} Execution Toolkit!\n\n🔒 QUICK FOLLOWER CHECK:\nTo unlock your direct access link & 20% VIP coupon code, please make sure you follow ${currentHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to verify and claim your bundle! 🚀`,
        step2PayloadDm: `🎉 VIP Access Granted @{username}!\n\n🚀 Here is your direct link to the Master Toolkit:\n${productCheckoutUrl}\n\n🎁 DISCOUNT CODE: Use code 'VIP20' at checkout for an instant 20% off!\n\nLet us know if you need any setup assistance! 💡`,
        publicCommentReply: `@{username} Check your DMs! ⚡ Sent you the follower-confirmation message with your VIP discount!`,
      };

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 5: AFFILIATE DEALS & TOOL REVIEWS
    // ─────────────────────────────────────────────────────────────────────────────
    } else {
      const affiliateUrl = `${siteUrl}/go/crypto-tracker`;
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Review Hook',
          headline: `We Tested the Top ${niche.toUpperCase()} Tools for 90 Days`,
          subtext: 'The Unbiased Benchmark: Which One Is Actually Worth It?',
          visualCue: 'Side-by-side comparison showdown graphic with glowing winner badge',
          calloutBadge: '🛡️ UNBIASED BENCHMARK',
        },
        {
          slideNumber: 2,
          type: 'Evaluation Criteria',
          headline: '1. How We Tested Them',
          subtext: 'Evaluated across 4 key criteria: Security, Execution Speed, Fee Transparency, and Mobile UX.',
          visualCue: '4-pillar rating matrix with stars',
          calloutBadge: 'TESTING CRITERIA',
        },
        {
          slideNumber: 3,
          type: 'The Flaws of Competitors',
          headline: '2. Where Most Alternatives Fall Short',
          subtext: 'Hidden withdrawal fees, slow customer support, and frequent downtime during market spikes.',
          visualCue: 'Red warning callout flags on legacy tools',
          calloutBadge: 'CRITICAL FLAWS',
        },
        {
          slideNumber: 4,
          type: 'The Clear Winner',
          headline: '3. The #1 Rated Platform in 2026',
          subtext: 'Industry-leading security, lowest slippage rates, and seamless multi-device synchronization.',
          visualCue: 'Gold trophy badge with #1 ranking card',
          calloutBadge: 'TOP PICK',
        },
        {
          slideNumber: 5,
          type: 'Feature Deep-Dive',
          headline: '4. Standout Features',
          subtext: '• Real-time automated rebalancing\n• Institutional-grade cold storage\n• 24/7 priority live support',
          visualCue: 'Feature highlight cards with green checkmarks',
          calloutBadge: 'STANDOUT CAPABILITIES',
        },
        {
          slideNumber: 6,
          type: 'Cost Comparison',
          headline: '5. Real Fee Comparison',
          subtext: 'Save up to 45% in annual fees compared to traditional Tier-1 platforms.',
          visualCue: 'Annual cost savings comparison bar chart',
          calloutBadge: 'FEE SAVINGS',
        },
        {
          slideNumber: 7,
          type: 'Security Audit',
          headline: '6. Verified Security & Backing',
          subtext: 'SOC-2 compliant, fully audited smart contracts, and proof of 1:1 reserves.',
          visualCue: 'Security shield with verification checkmark',
          calloutBadge: 'SECURITY VERIFIED',
        },
        {
          slideNumber: 8,
          type: 'Who It Is For',
          headline: '7. Best For Beginners & Pros',
          subtext: 'Intuitive simplified interface for newcomers, advanced API telemetry for power users.',
          visualCue: 'Beginner vs Pro feature mapping diagram',
          calloutBadge: 'USER AUDIENCE',
        },
        {
          slideNumber: 9,
          type: 'Exclusive Partner Bonus',
          headline: '8. Special Welcome Bonus Deal',
          subtext: 'Get up to $50 in bonus trading credits + zero fee trading on your first 30 days.',
          visualCue: 'Bonus gift card graphic with glowing emerald border',
          calloutBadge: '🎁 PARTNER BONUS',
        },
        {
          slideNumber: 10,
          type: 'Affiliate Link Auto-DM & Follow Gate',
          headline: 'Comment Below for the Official Link & Bonus',
          subtext: `Comment ANYTHING below (or type "${keyword}") and follow ${currentHandle} to get the verified bonus link & cashback guide in your DMs!`,
          visualCue: 'Glowing gift box icon + follower check badge',
          calloutBadge: '🛡️ CLAIM EXCLUSIVE BONUS',
        },
      ];

      reelScript = {
        duration: '40 Seconds',
        hook0to3s: `If you are still using outdated tools in 2026, you are losing money on hidden fees.`,
        body3to35s: `We spent 90 days stress-testing the top platforms. One platform completely outperformed everything else in speed, security, and low fees.\n\nWe partnered with them to get our community a zero-fee trial plus exclusive bonus credits.`,
        cta35to45s: `Comment anything below! Follow ${currentHandle} and our bot will DM you the direct bonus link immediately!`,
        onScreenText: [
          '🛡️ 90-Day Platform Showdown',
          'Lowest Fees & Top Security',
          'Exclusive Community Bonus',
          `Comment Below (Follow ${currentHandle})`,
        ],
        soundRecommendation: 'Punchy Electronic Beat / Tech Showcase Sound',
      };

      facebookPost = {
        headline: `🛡️ Comprehensive Review: The Best ${niche.toUpperCase()} Platform of 2026`,
        body: `After 90 days of rigorous benchmarking, here is our transparent review of the top platform:\n\n⭐ Key Strengths:\n• Zero hidden withdrawal fees\n• 1:1 Verified reserve backing\n• Seamless mobile & desktop sync\n\n🎁 Exclusive Community Bonus: Our readers get up to $50 in bonus credits + 30 days zero fee trading.\n\n👇 The verified link & review summary is in the FIRST COMMENT below.`,
        firstComment: `🎁 Claim your exclusive bonus & review here: ${affiliateUrl}`,
      };

      instagramCaption = `We benchmarked the top ${niche.toUpperCase()} platforms for 90 days so you don't have to. 🛡️📊\n\nSwipe through the slides above to see the fee breakdowns, security audits, and why this platform won.\n\n🎁 Want our verified link to claim $50 in bonus credits?\n\n👉 Comment ANYTHING below (or type "${keyword}")!\n\n🔒 Follower Check: Make sure you follow ${currentHandle} so our system can verify and DM you the bonus link instantly!\n\n.\n.\n#reviews #${niche} #tools #bonus #fintech #2026guide`;

      followGateInfo = {
        step1FollowRequestDm: `Hey @{username}! 🛡️ Thanks for engaging with our ${niche.toUpperCase()} tool review!\n\n🔒 QUICK FOLLOWER CHECK:\nTo unlock your verified bonus link & cashback guide, please make sure you follow ${currentHandle}.\n\n👉 Once followed, tap 'I Am Following ✅' below to verify and get your link! 🎁`,
        step2PayloadDm: `🎉 Bonus Link Unlocked for @{username}!\n\n🚀 Here is your exclusive partner link + $50 bonus credits:\n${affiliateUrl}\n\nEnjoy the platform and feel free to message us with any setup questions! 💡`,
        publicCommentReply: `@{username} Check your DMs! 🛡️ Sent you the message to confirm your bonus access link!`,
      };
    }

    return NextResponse.json({
      success: true,
      title,
      niche,
      campaignGoal,
      pageHandle: currentHandle,
      triggerKeyword: keyword,
      targetUrl: directArticleUrl,
      followGateInfo,
      carouselSlides,
      reelScript,
      facebookPost,
      instagramCaption,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate agency creative' }, { status: 500 });
  }
}
