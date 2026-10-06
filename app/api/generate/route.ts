import { NextResponse } from 'next/server';
import path from 'path';
import { generateContentWithFailover } from '@/lib/ai-failover';
import { resilientReadJson, atomicWriteJson } from '@/lib/atomic-storage';

import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const TOKEN_USAGE_PATH = path.join(process.cwd(), 'data', 'token_usage.json');

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

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

    // Read current token usage
    const usage = await resilientReadJson(TOKEN_USAGE_PATH, { month: currentMonth(), tokensUsed: 0, estimatedCost: 0 });
    const maxBudget = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET || '50');

    // If over budget and OpenAI only, warn
    if (usage.month === currentMonth() && usage.estimatedCost >= maxBudget && !process.env.NVIDIA_API_KEY) {
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

    // Update usage tracking safely
    const updatedUsage = {
      month: currentMonth(),
      tokensUsed: (usage.month === currentMonth() ? usage.tokensUsed : 0) + result.tokensUsed,
      estimatedCost: (usage.month === currentMonth() ? usage.estimatedCost : 0) + result.estimatedCost,
    };
    await atomicWriteJson(TOKEN_USAGE_PATH, updatedUsage);

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
