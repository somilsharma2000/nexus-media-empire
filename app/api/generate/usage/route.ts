import { NextResponse } from 'next/server';
import { getTokenUsage } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await getTokenUsage(currentMonth);

    const budgetUsd = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET ?? '20');
    const estimatedCost = usage.estimatedCost || 0;
    const remaining = Math.max(0, budgetUsd - estimatedCost);

    return NextResponse.json({
      month: usage.month || currentMonth,
      tokensUsed: usage.tokensUsed || 0,
      estimatedCost: parseFloat(estimatedCost.toFixed(6)),
      budgetUsd,
      remainingUsd: parseFloat(remaining.toFixed(6)),
    });
  } catch {
    return NextResponse.json({
      month: new Date().toISOString().slice(0, 7),
      tokensUsed: 0,
      estimatedCost: 0,
      budgetUsd: 20,
      remainingUsd: 20,
    });
  }
}
