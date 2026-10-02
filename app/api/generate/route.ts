import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ─── Pricing constants (gpt-4o-mini) ─────────────────────────────────────────
const INPUT_COST_PER_M  = 0.150; // $ per 1M input tokens
const OUTPUT_COST_PER_M = 0.600; // $ per 1M output tokens

// ─── Paths ────────────────────────────────────────────────────────────────────
const TOKEN_USAGE_PATH = path.join(process.cwd(), 'data', 'token_usage.json');

// ─── Token-usage helpers ──────────────────────────────────────────────────────
async function readTokenUsage() {
  try {
    const raw = await fs.readFile(TOKEN_USAGE_PATH, 'utf-8');
    return JSON.parse(raw) as { month: string; tokensUsed: number; estimatedCost: number };
  } catch {
    return { month: '', tokensUsed: 0, estimatedCost: 0 };
  }
}

async function writeTokenUsage(data: { month: string; tokensUsed: number; estimatedCost: number }) {
  await fs.mkdir(path.dirname(TOKEN_USAGE_PATH), { recursive: true });
  await fs.writeFile(TOKEN_USAGE_PATH, JSON.stringify(data, null, 2));
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function calcCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_M +
         (outputTokens / 1_000_000) * OUTPUT_COST_PER_M;
}

// ─── Exponential-backoff OpenAI call ─────────────────────────────────────────
async function callOpenAIWithRetry(
  openai: OpenAI,
  params: Parameters<typeof openai.chat.completions.create>[0],
  maxAttempts = 3,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const delays = [1000, 2000, 4000];
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (openai.chat.completions.create as any)(params, { timeout: 60000 });
      return result as OpenAI.Chat.Completions.ChatCompletion;
    } catch (err: unknown) {
      lastError = err;
      // Check for OpenAI rate-limit (429) or a generic error with status 429
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < maxAttempts - 1) {
        await new Promise((res) => setTimeout(res, delays[attempt]));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ─── Format matrix ────────────────────────────────────────────────────────────
const FORMAT_INSTRUCTIONS: Record<string, string> = {
  'deep-dive': 'Write a 1400-1500 word in-depth analysis article',
  'listicle':  'Write a 1200-1400 word numbered list article (7-10 items)',
  'news':      'Write a 1200-1300 word breaking news style article',
};
const FORMAT_KEYS = Object.keys(FORMAT_INSTRUCTIONS) as Array<keyof typeof FORMAT_INSTRUCTIONS>;

// ─── POST /api/generate ───────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. API key guard
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured', code: 'NO_API_KEY' },
      { status: 503 },
    );
  }

  // 2. Parse body
  const body = await request.json();
  const { topic, category } = body as { topic: string; category: string; format?: string };
  const rawFormat = body.format as string | undefined;

  // 3. Resolve format (randomise if not provided or unrecognised)
  const format: string =
    rawFormat && FORMAT_INSTRUCTIONS[rawFormat]
      ? rawFormat
      : FORMAT_KEYS[Math.floor(Math.random() * FORMAT_KEYS.length)];

  // 4. Budget guard
  const budgetUsd = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET ?? '20');
  const usage = await readTokenUsage();
  const month = currentMonth();

  // Reset if new month
  if (usage.month !== month) {
    usage.month = month;
    usage.tokensUsed = 0;
    usage.estimatedCost = 0;
  }

  if (usage.estimatedCost >= budgetUsd) {
    return NextResponse.json(
      {
        error: 'Monthly AI budget cap reached',
        code: 'BUDGET_CAP',
        budgetUsd,
        spentUsd: usage.estimatedCost,
      },
      { status: 429 },
    );
  }

  // 5. Build prompts
  const systemPrompt = `You are an elite media journalist. Generate a GEO-optimized content package.
Return ONLY a valid JSON object with these exact keys:
{
  "article": "Full markdown article starting with # H1 Title. Must include: Key Takeaways bullet list, statistics, subheadings (##), and 1200-1500 words.",
  "metaDescription": "SEO meta description under 160 characters",
  "tweetThread": ["Tweet 1 (hook)", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5", "Tweet 6 (CTA)"]
}`;

  const userPrompt = `${FORMAT_INSTRUCTIONS[format]} about: ${topic}. Category: ${category}. Make it authoritative, cite statistics, and format for Perplexity/Google AI Overview citation.`;

  // 6. Call OpenAI with retry
  const openai = new OpenAI({ apiKey });

  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    completion = await callOpenAIWithRetry(openai, {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });
  } catch (err: unknown) {
    console.error('[generate] OpenAI call failed:', err);
    return NextResponse.json(
      { error: 'OpenAI request failed', details: String(err) },
      { status: 502 },
    );
  }

  // 7. Parse result
  const raw = completion.choices[0]?.message?.content ?? '{}';
  let parsed: { article?: string; metaDescription?: string; tweetThread?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response JSON' }, { status: 502 });
  }

  const { article = '', metaDescription = '', tweetThread = [] } = parsed;

  // 8. Token accounting
  const inputTokens  = completion.usage?.prompt_tokens     ?? 0;
  const outputTokens = completion.usage?.completion_tokens ?? 0;
  const callCost     = calcCost(inputTokens, outputTokens);

  usage.tokensUsed   += inputTokens + outputTokens;
  usage.estimatedCost = parseFloat((usage.estimatedCost + callCost).toFixed(6));
  await writeTokenUsage(usage);

  // 9. Return
  return NextResponse.json({
    success: true,
    data: {
      blog:            article,
      metaDescription,
      tweets:          tweetThread,
      tokensUsed:      inputTokens + outputTokens,
      estimatedCost:   callCost,
    },
  });
}
