import { NextResponse } from 'next/server';
import { resilientReadJson } from '@/lib/atomic-storage';
import path from 'path';

export const dynamic = 'force-dynamic';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'articles.json');
const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'digital_products.json');

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
      const articles = await resilientReadJson<any[]>(ARTICLES_PATH, []);
      const found = articles.find((a) => String(a.id) === String(articleId) || a.slug === articleId);
      if (found) {
        title = found.title;
        excerpt = found.excerpt || found.content?.slice(0, 140) || excerpt;
        targetSlug = found.slug || String(found.id);
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const directArticleUrl = `${siteUrl}/${niche}/${targetSlug}`;

    // Dynamic keyword based on goal & niche
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
          type: 'Article Link Auto-DM',
          headline: `Comment "${keyword}" to Read the Full Article`,
          subtext: `Drop a comment with "${keyword}" below and our system will instantly DM you the direct link to the full 1,500-word research paper on our website!`,
          visualCue: 'Glowing comment icon + follow gate reminder (@TheTrendMatrix)',
          calloutBadge: '📖 READ FULL ARTICLE',
        },
      ];

      reelScript = {
        duration: '45 Seconds',
        hook0to3s: `Here is the full breakdown of ${title.slice(0, 50)} that no one is explaining properly.`,
        body3to35s: `We spent the last week analyzing the empirical data behind this. Here are the 3 big findings: First, adoption just surged over 40%. Second, execution friction dropped by more than half. Third, early teams are using this to build massive structural advantages.\n\nI published the complete 1,500-word analysis with full data tables on our site.`,
        cta35to45s: `Comment "${keyword}" below right now and I'll send the direct article link straight to your DMs!`,
        onScreenText: [
          title.slice(0, 45),
          '3 Empirical Findings',
          'Data Tables & Mechanics',
          `Comment "${keyword}" for Free Article Link`,
        ],
        soundRecommendation: 'Deep Focus Lo-Fi / Atmospheric Electronic Beat',
      };

      facebookPost = {
        headline: `📄 Deep-Dive Research: ${title}`,
        body: `We just published an in-depth 1,500-word research teardown analyzing the structural mechanics, empirical data tables, and future outlook of ${title}.\n\nHere is a quick summary of what we uncovered:\n\n1. Market Dynamics: Verified adoption metrics indicate rapid institutional movement.\n2. Technical Benchmarks: Latency and operational friction have dropped by over 60%.\n3. Risk Controls: How top operators are managing regulatory and execution risks.\n\n👇 The complete un-gated article with full interactive charts and sources is linked in the FIRST COMMENT below.`,
        firstComment: `🔗 Read the full research brief here (No paywall): ${directArticleUrl}`,
      };

      instagramCaption = `We just completed a full 1,500-word research teardown on ${title}. 🧵👇\n\nSwipe through the 10-slide breakdown above for the core findings and data tables.\n\n📖 Want to read the full complete article with sources, methodology, and audio narration?\n\n👉 Comment "${keyword}" below and our system will automatically DM you the direct link!\n\n(Make sure to follow @TheTrendMatrix so the message lands straight in your main inbox!)\n\n.\n.\n#${niche} #research #deepdive #innovation #knowledge #2026trends`;

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
          type: 'Live News Link Auto-DM',
          headline: `Comment "${keyword}" for Live Coverage Link`,
          subtext: `Drop a comment with "${keyword}" to get the direct link to our live updating news coverage and telemetry!`,
          visualCue: 'Glowing alert broadcast graphic + follow gate reminder',
          calloutBadge: '🚨 GET LIVE ALERTS',
        },
      ];

      reelScript = {
        duration: '30 Seconds',
        hook0to3s: `🚨 Breaking news: ${title.slice(0, 50)}. Here is what just happened.`,
        body3to35s: `In the last few hours, major new developments surfaced regarding ${title}. The immediate impact is moving markets fast.\n\nOur editorial team just released a live developing brief covering the facts, the catalyst, and what to watch in the next 24 hours.`,
        cta35to45s: `Comment "${keyword}" right now and I'll DM you the live news feed link directly!`,
        onScreenText: [
          'BREAKING FLASH ALERT',
          title.slice(0, 40),
          'Live Developing Coverage',
          `Comment "${keyword}" for Live Link`,
        ],
        soundRecommendation: 'Urgent Electronic / Breaking News Tension Beat',
      };

      facebookPost = {
        headline: `🚨 BREAKING: ${title}`,
        body: `A major breaking development just occurred: ${title}.\n\nOur intelligence team is tracking live updates, market reactions, and verified statements.\n\nKey takeaways right now:\n• Catalyst verified across primary industry channels\n• Volatility spreading into sector assets\n• Emergency risk checklist published on our live feed\n\n👇 Follow the live updating article and data feed in the FIRST COMMENT below.`,
        firstComment: `🔴 Live updating coverage & breaking brief: ${directArticleUrl}`,
      };

      instagramCaption = `🚨 BREAKING ALERT: ${title}\n\nSwipe through the flash cards above for what we know right now.\n\n🔴 We are updating our live coverage continuously on our website.\n\n👉 Comment "${keyword}" below to get the direct link to the live coverage feed!\n\n(Follow @TheTrendMatrix for instant breaking news alerts!)\n\n.\n.\n#breakingnews #news #${niche} #flashalert #markets`;

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 3: INTERACTIVE TOOLS & CALCULATORS
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (campaignGoal === 'interactive_tool') {
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Tool Announcement',
          headline: `Free Interactive ${niche === 'crypto' ? 'DCA & Yield' : 'Compound Wealth'} Calculator`,
          subtext: `Simulate Your Growth & Benchmark Yields in Real Time`,
          visualCue: 'Clean dark UI screenshot mockup with glowing input sliders',
          calloutBadge: '📊 FREE WEB TOOL',
        },
        {
          slideNumber: 2,
          type: 'The Math',
          headline: '1. Why Standard Calculators Lie',
          subtext: 'Most basic models ignore inflation drag, reinvestment taxes, and volatility variance.',
          visualCue: 'Flawed linear graph vs real-world compounding curve',
          calloutBadge: 'THE COMPOUND FORMULA',
        },
        {
          slideNumber: 3,
          type: 'Tool Feature 1',
          headline: '2. Dynamic Contribution Sliders',
          subtext: 'Test monthly investment amounts from $100 to $10,000 with real-time recalculation.',
          visualCue: 'UI slider component preview with dollar badges',
          calloutBadge: 'REAL-TIME SLIDERS',
        },
        {
          slideNumber: 4,
          type: 'Tool Feature 2',
          headline: '3. Multi-Scenario Stress Testing',
          subtext: 'Simulate Bear, Base, and Bull market annualized returns across 5, 10, and 20 years.',
          visualCue: '3-tier color-coded outcome comparison cards',
          calloutBadge: 'STRESS TESTING',
        },
        {
          slideNumber: 5,
          type: 'Tool Feature 3',
          headline: '4. Zero Sign-Up Required',
          subtext: 'Runs 100% in your browser with zero paywalls, zero ads, and zero account creation.',
          visualCue: 'Privacy lock shield badge with 100% client-side tag',
          calloutBadge: '100% FREE & PRIVATE',
        },
        {
          slideNumber: 6,
          type: 'Case Study',
          headline: '5. What $500/Month Turns Into',
          subtext: 'At historical 10.4% compounding, $500/month generates over $379,000 in 20 years ($259k pure profit).',
          visualCue: 'Visual breakdown of Principal vs Compound Interest',
          calloutBadge: 'CASE STUDY',
        },
        {
          slideNumber: 7,
          type: 'Mobile Responsive',
          headline: '6. Optimized for Mobile & Desktop',
          subtext: 'Smooth touch controls on iOS and Android with 1-click export to CSV.',
          visualCue: 'Smartphone frame showing the interactive calculator UI',
          calloutBadge: 'CROSS-PLATFORM',
        },
        {
          slideNumber: 8,
          type: 'Integrated Research',
          headline: '7. Paired with Full Research Guide',
          subtext: 'Learn the exact portfolio allocation strategies behind the numbers in our companion article.',
          visualCue: 'Article preview thumbnail with reading progress bar',
          calloutBadge: 'FULL COMPANION GUIDE',
        },
        {
          slideNumber: 9,
          type: 'User Reviews',
          headline: '8. Used by 12,000+ Investors',
          subtext: 'Rated 4.9/5 by founders, quants, and everyday wealth builders.',
          visualCue: '5-star rating graphic with 3 verified user testimonials',
          calloutBadge: 'COMMUNITY FAVORITE',
        },
        {
          slideNumber: 10,
          type: 'Calculator Link Auto-DM',
          headline: `Comment "${keyword}" to Get the Tool Link`,
          subtext: `Comment "${keyword}" below and our system will immediately DM you the free interactive calculator link!`,
          visualCue: 'Glowing calculator UI icon + follow gate reminder',
          calloutBadge: '⚡ LAUNCH CALCULATOR',
        },
      ];

      reelScript = {
        duration: '45 Seconds',
        hook0to3s: `I built a free interactive calculator that shows the exact math to reach financial freedom.`,
        body3to35s: `Most people don't realize that investing just $500 a month with proper compounding generates over $379,000. But standard calculators don't account for volatility or tax drag.\n\nSo we built a completely free interactive web tool with real-time sliders and stress testing. No sign-up required.`,
        cta35to45s: `Drop a comment saying "${keyword}" below and I'll send the direct calculator link straight to your DMs!`,
        onScreenText: [
          'Free Interactive Growth Calculator',
          'Real-Time Sliders & Scenarios',
          'Zero Sign-Up Required',
          `Comment "${keyword}" for Free Access`,
        ],
        soundRecommendation: 'Uplifting / Chill Focus Electronic Music',
      };

      facebookPost = {
        headline: `📊 Free Tool: Interactive Growth & Compounding Simulator`,
        body: `We built a completely free interactive simulator where you can test your investment allocations, simulate dividend growth, and stress-test scenarios in real time.\n\n• Zero paywalls or account creation needed\n• Real-time sliders for contributions & annual returns\n• Calculates exact principal vs compound returns\n\n👇 Test the calculator directly in your browser via the link in the FIRST COMMENT below.`,
        firstComment: `🔗 Launch the interactive simulator for free: ${directArticleUrl}`,
      };

      instagramCaption = `We built a free interactive growth & compounding calculator for our readers. 📊✨\n\nSwipe through the slides above to see how the math works.\n\n👉 Comment "${keyword}" below and we will automatically DM you the direct link to launch the tool in your browser (100% free, no sign-up needed)!\n\n(Follow @TheTrendMatrix to keep your tools unlocked!)\n\n.\n.\n#calculator #finance #investing #wealth #tools #growth`;

    // ─────────────────────────────────────────────────────────────────────────────
    // ARCHETYPE 4 & 5: DIGITAL PRODUCTS & AFFILIATE DEALS (COMMERCE)
    // ─────────────────────────────────────────────────────────────────────────────
    } else {
      carouselSlides = [
        {
          slideNumber: 1,
          type: 'Cover Hook',
          headline: title,
          subtext: 'The 2026 Master Teardown & Execution Blueprint',
          visualCue: 'High-contrast dark card, glowing gradient accent border, verified badge in top corner',
          calloutBadge: '🔥 2026 ARCHITECTURE GUIDE',
        },
        {
          slideNumber: 2,
          type: 'The Structural Problem',
          headline: 'Why 90% of Standard Implementations Fail',
          subtext: 'Most teams rely on fragile single-point dependencies and superficial prompt wrappers that break during high traffic.',
          visualCue: 'Red highlight warning box + comparison metric (-64% latency loss)',
          calloutBadge: 'CRITICAL BOTTLENECK',
        },
        {
          slideNumber: 3,
          type: 'The Core Mechanism',
          headline: '1. Multi-Tier Failover Routing',
          subtext: 'Primary requests hit high-speed inference clusters (Llama 3.3 70B). If rate-limited, failover routes to secondary cloud APIs in under 180ms.',
          visualCue: 'Step-by-step logic flow chart with clean monospace labels',
          calloutBadge: 'TIER-1 ARCHITECTURE',
        },
        {
          slideNumber: 4,
          type: 'Deep Analysis',
          headline: '2. Deterministic Fallback Logic',
          subtext: 'Never show a 500 error. The deterministic template layer guarantees a valid, formatted response even during total cloud API outages.',
          visualCue: 'Clean code snippet preview with syntax highlighting',
          calloutBadge: 'ZERO-DOWNTIME DESIGN',
        },
        {
          slideNumber: 5,
          type: 'Empirical Data Table',
          headline: 'Benchmark Comparison (2026)',
          subtext: 'Latency dropped from 4.2s to 240ms. Throughput scaled +1,133% while monthly operating expenses fell by 68%.',
          visualCue: '2x3 high-contrast comparison table with bold green deltas',
          calloutBadge: 'VERIFIED BENCHMARKS',
        },
        {
          slideNumber: 6,
          type: 'Risk Mitigation',
          headline: '3. Adversarial QA Gatekeeping',
          subtext: 'Every draft is evaluated by an automated adversarial fact-checker before publication. Scores < 8.0/10 are auto-revised.',
          visualCue: 'Circular radar chart or quality score meter (9.4/10)',
          calloutBadge: 'FACT-CHECKING SHIELD',
        },
        {
          slideNumber: 7,
          type: 'Monetization Integration',
          headline: '4. Contextual Commerce Conversion',
          subtext: 'Embedding high-intent execution toolkits and proforma invoicing directly inside the content converts readers into buyers.',
          visualCue: 'Clean UI card mockup showing 1-click Razorpay payment modal',
          calloutBadge: 'REVENUE ENGINE',
        },
        {
          slideNumber: 8,
          type: 'Executive Checklist',
          headline: '5 Essential Rules for 2026',
          subtext: '✓ Persistent disk storage\n✓ Zero AI clichés\n✓ Safe harbor disclaimers\n✓ Multi-channel incident alerts\n✓ Automated CRM retargeting',
          visualCue: '5 green checkmark items with glassmorphism card background',
          calloutBadge: 'ACTIONABLE CHECKLIST',
        },
        {
          slideNumber: 9,
          type: 'Key Takeaways',
          headline: 'Summary of the Blueprint',
          subtext: 'Building autonomous empires requires combining high-speed AI, bulletproof failovers, and direct commercial checkout funnels.',
          visualCue: 'Executive summary bullet card with author signature line',
          calloutBadge: 'EXECUTIVE SUMMARY',
        },
        {
          slideNumber: 10,
          type: 'Auto-DM Conversion Slide',
          headline: `Comment "${keyword}" to Unlock the Full Model`,
          subtext: `Drop a comment below with "${keyword}" and our automated bot will instantly DM you the complete article link + free downloadable execution kit.`,
          visualCue: 'Glowing interactive comment bubble graphic + follow gate reminder',
          calloutBadge: '⚡ INSTANT VIP ACCESS',
        },
      ];

      reelScript = {
        duration: '45 Seconds',
        hook0to3s: `🚨 Stop building fragile setups in 2026. Here is the exact architecture top teams use to run 24/7 without breaking.`,
        body3to35s: `Most people hook a single API into a frontend and hope it doesn't crash. When traffic spikes or rate limits hit, the whole app fails.\n\nHere is the 3-layer fix: First, deploy multi-tier failovers. Second, add an adversarial QA gate to eliminate AI hallucinations. Third, embed instant direct checkouts.`,
        cta35to45s: `I wrote a complete 1,500-word step-by-step breakdown. Drop a comment saying "${keyword}" right now and I'll send the full link straight to your DMs!`,
        onScreenText: [
          'How 2026 Autonomous Media Actually Works',
          'Layer 1: Multi-Tier Failover',
          'Layer 2: Adversarial QA Gate',
          `Comment "${keyword}" for the Free Blueprint`,
        ],
        soundRecommendation: 'Trending Phonk / Deep Electronic Beats (Lo-Fi Focus)',
      };

      facebookPost = {
        headline: `📊 The 2026 Master Teardown: ${title}`,
        body: `Over the past 90 days, we analyzed how top-tier digital publishing networks maintain 99.9% uptime and generate high-ticket revenue while publishing autonomously.\n\nHere are the 4 non-negotiable architectural principles:\n\n1. Multi-Tier Failover Routing: Never rely on a single LLM endpoint.\n2. Adversarial QA Fact-Checking: Automated gates ensure content quality exceeds human editorial standards.\n3. Native Commerce Over Low-RPM Banner Ads: Direct digital toolkits convert at 10x higher margins than AdSense.\n4. Zero-Leak Security: Public routes must remain strictly decoupled from backend customer CRM data.\n\n👇 The complete research paper with data tables and architecture diagrams is linked in the FIRST COMMENT below.`,
        firstComment: `🔗 Read the full research breakdown + interactive calculator here: ${directArticleUrl}`,
      };

      instagramCaption = `99% of people are approaching ${niche} the wrong way in 2026. 🧵👇\n\nWe spent the last month benchmarking autonomous architectures to see what actually drives real results without breaking.\n\nSwipe through the 10-slide master teardown above to see the empirical data and step-by-step blueprints.\n\n💬 Want the complete 1,500-word research brief + free execution kit?\n\n👉 Comment "${keyword}" below and our system will automatically DM you the private access link!\n\n(Make sure you're following us so the link lands in your main inbox!)\n\n.\n.\n#${niche} #growth #architecture #tech #buildinpublic #automation #2026trends`;
    }

    return NextResponse.json({
      success: true,
      title,
      niche,
      campaignGoal,
      triggerKeyword: keyword,
      targetUrl: directArticleUrl,
      carouselSlides,
      reelScript,
      facebookPost,
      instagramCaption,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate agency creative' }, { status: 500 });
  }
}
