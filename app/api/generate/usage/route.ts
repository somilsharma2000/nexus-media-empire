import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const TOKEN_USAGE_PATH = path.join(process.cwd(), 'data', 'token_usage.json');

export async function GET() {
  try {
    const raw = await fs.readFile(TOKEN_USAGE_PATH, 'utf-8');
    const usage = JSON.parse(raw) as { month: string; tokensUsed: number; estimatedCost: number };

    const budgetUsd = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET ?? '20');
    const remaining = Math.max(0, budgetUsd - usage.estimatedCost);

    return NextResponse.json({
      ...usage,
      budgetUsd,
      remainingUsd: parseFloat(remaining.toFixed(6)),
    });
  } catch {
    return NextResponse.json(
      { month: '', tokensUsed: 0, estimatedCost: 0, budgetUsd: 20, remainingUsd: 20 },
    );
  }
}
