import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic, niche } = await request.json();
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const templates = [
      {
        type: 'Deep Dive',
        blog: `# The Silent Rise of ${topic}\n\nWhile the mainstream media is distracted, the ${niche} sector is undergoing a massive transformation. **${topic}** is no longer a fringe concept; it is the foundation of the next decade.\n\n## The Data Speaks\nRecent metrics show a 310% surge in enterprise adoption. Why? Because the legacy systems are breaking.\n\n### Three Things You Must Know:\n* **Cost Efficiency:** Overhead is reduced by nearly 40%.\n* **Scalability:** It scales infinitely without human bottlenecks.\n* **Security:** Cryptographic protocols ensure zero data leaks.\n\nAre you positioned for this shift?`,
        tweets: [
          `🚨 BREAKING: ${topic} is quietly taking over the ${niche} space. \n\nHere is what the media isn't telling you. 🧵 1/4`,
          `Legacy systems are dying. We are seeing a 310% surge in adoption for ${topic}. The cost efficiency alone is staggering. 2/4`,
          `The best part? It scales infinitely. No more human bottlenecks. No more data leaks. 3/4`,
          `If you are building in ${niche} and ignoring this, you are NGMI. Drop your thoughts below. 👇 4/4`
        ],
        image: `A hyper-realistic, highly detailed macro shot of a glowing microchip representing ${topic}, dark cinematic lighting, glowing blue and purple circuitry, 8k resolution, Unreal Engine 5 render --ar 16:9`
      },
      {
        type: 'Listicle',
        blog: `# 5 Reasons ${topic} Will Dominate in 2026\n\nIf you work in ${niche}, you need to pay attention. The landscape is shifting, and **${topic}** is leading the charge. Here are the top 5 reasons why.\n\n## 1. Unprecedented ROI\nEarly investors are seeing returns that defy traditional market logic.\n\n## 2. Regulatory Tailwinds\nNew frameworks are actually *encouraging* innovation in this space.\n\n## 3. The Talent Migration\nTop engineers from FAANG are leaving to build in this ecosystem.\n\n## 4. Decentralization\nPower is shifting back to the users.\n\n## 5. Mainstream Adoption\nIt's no longer just for tech insiders.\n\nDon't get left behind.`,
        tweets: [
          `Top 5 reasons ${topic} will completely dominate the ${niche} market by 2026. \n\nA quick thread 🧵👇 1/5`,
          `1. Unprecedented ROI. Early adopters are seeing returns that defy logic.\n2. Regulatory tailwinds. The government is finally getting out of the way. 2/5`,
          `3. Brain Drain. Top FAANG engineers are quietly migrating to build ${topic} infrastructure. 3/5`,
          `4. True decentralization.\n5. Mainstream adoption is here. It's not just a tech-bubble anymore. 4/5`,
          `Are you positioned for the shift? Bookmark this thread and check back in 12 months. 📈 5/5`
        ],
        image: `A stunning minimalist digital art piece representing ${topic}, clean lines, isometric perspective, corporate tech style, white and electric blue color palette, 8k --ar 16:9`
      },
      {
        type: 'News Report',
        blog: `# BREAKING: Major Shift in ${topic} Shakes the ${niche} Industry\n\n**San Francisco, CA** — In a stunning development today, insiders revealed a massive pivot regarding **${topic}**. \n\n## What Happened?\nFor months, rumors circulated about systemic changes in the ${niche} sector. Today, those rumors were validated. The integration of ${topic} into core infrastructure is happening faster than anyone predicted.\n\n"We are looking at a fundamental rewiring of how business operates," said one lead engineer. \n\n## Market Reaction\nMarkets have responded aggressively, with related assets surging. As this story develops, one thing is clear: the old way of doing things is officially dead.`,
        tweets: [
          `⚠️ MASSIVE UPDATE IN ${niche.toUpperCase()} ⚠️\n\nThe rumors about ${topic} were true. Everything is changing. 🧵 1/3`,
          `Insiders just confirmed that the integration of ${topic} into core infrastructure is happening 10x faster than predicted. "A fundamental rewiring." 2/3`,
          `The old way of doing things is dead. Markets are already pricing this in. Are you paying attention? 3/3`
        ],
        image: `A futuristic trading floor or command center, holographic data screens displaying information about ${topic}, cinematic lighting, photorealistic, depth of field --ar 16:9`
      }
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    return NextResponse.json({
      success: true,
      data: {
        blog: randomTemplate.blog,
        tweets: randomTemplate.tweets,
        imagePrompt: randomTemplate.image
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to generate content" }, { status: 500 });
  }
}
