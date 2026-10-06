import { NextResponse } from 'next/server';
import { generateContentWithFailover } from '@/lib/ai-failover';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { getTokenUsage, updateTokenUsage } from '@/lib/data-layer';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, 5, 60000);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetMs);
  }

  try {
    let body: { topic?: string; category?: string; format?: 'deep-dive' | 'listicle' | 'news' } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { topic, category = 'Technology', format = 'deep-dive' } = body;
    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Read current token usage from database
    const usage = await getTokenUsage();
    const maxBudget = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET || '50');

    // If over budget and OpenAI only, warn
    if (usage.estimatedCost >= maxBudget && !process.env.NVIDIA_API_KEY) {
      return NextResponse.json(
        {
          error: 'Monthly OpenAI budget cap reached. Upgrade budget or connect NVIDIA API Key.',
          code: 'BUDGET_CAP',
          budgetUsd: maxBudget,
          spentUsd: usage.estimatedCost,
        },
        { status: 429 }
      );
    }

    // Call Multi-Tier Resilient AI Engine (NVIDIA -> OpenAI -> Deterministic Engine)
    const result = await generateContentWithFailover({
      topic: topic.trim(),
      category: category.trim(),
      format,
    });

    // Update usage tracking in database
    await updateTokenUsage(result.tokensUsed || 0, result.estimatedCost || 0);

    return NextResponse.json({
      success: true,
      data: {
        blog: result.article,
        metaDescription: result.metaDescription,
        tweets: result.tweetThread,
        provider: result.providerUsed,
        tokensUsed: result.tokensUsed,
        estimatedCost: result.estimatedCost,
      },
    });
  } catch (err: any) {
    console.error('[API GENERATE ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal generation failure', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
