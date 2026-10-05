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
  // 1. API key guard (Supports NVIDIA NIM and OpenAI)
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NVIDIA_API_KEY or OPENAI_API_KEY not configured', code: 'NO_API_KEY' },
      { status: 503 },
    );
  }

  const isNvidia = !!process.env.NVIDIA_API_KEY;
  const baseURL = isNvidia 
    ? (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1')
    : (process.env.OPENAI_BASE_URL || undefined);
  const selectedModel = isNvidia
    ? (process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct')
    : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

  // 2. Parse body
  const body = await request.json();
  const { topic, category } = body as { topic: string; category: string; format?: string };
  const rawFormat = body.format as string | undefined;

  // 3. Resolve format
  const format: string =
    rawFormat && FORMAT_INSTRUCTIONS[rawFormat]
      ? rawFormat
      : FORMAT_KEYS[Math.floor(Math.random() * FORMAT_KEYS.length)];

  // 4. Budget guard
  const budgetUsd = parseFloat(process.env.MAX_MONTHLY_AI_BUDGET ?? '20');
  const thisMonth = currentMonth();
  let usage = await readTokenUsage();

  if (usage.month !== thisMonth) {
    usage = { month: thisMonth, tokensUsed: 0, estimatedCost: 0 };
    await writeTokenUsage(usage);
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

  const openai = new OpenAI({ apiKey, baseURL });
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // PASS 1: CORE TECHNICAL & FACTUAL DRAFT
    // ══════════════════════════════════════════════════════════════════════════
    const pass1System = `You are a Principal Tech & Financial Journalist. Write an exhaustive, highly authoritative, empirical 1200-1500 word article.
Requirements:
- Start with # H1 Title
- Include a blockquote with Key Takeaways (3-4 bullet points)
- Include at least 1 structured comparison Markdown table
- Include concrete 2026 data points, empirical benchmarks, and clear step-by-step frameworks
- Structure with clear ## and ### headings`;

    const pass1User = `${FORMAT_INSTRUCTIONS[format]} about: "${topic}". Category: "${category}". Target high search intent and GEO citation.`;

    const pass1Res = await callOpenAIWithRetry(openai, {
      model: selectedModel,
      temperature: 0.7,
      max_tokens: 2500,
      messages: [
        { role: 'system', content: pass1System },
        { role: 'user', content: pass1User },
      ],
    });

    const rawDraft = pass1Res.choices[0]?.message?.content ?? '';
    totalInputTokens += pass1Res.usage?.prompt_tokens ?? 0;
    totalOutputTokens += pass1Res.usage?.completion_tokens ?? 0;

    // ══════════════════════════════════════════════════════════════════════════
    // PASS 2: THE HUMAN TOUCH & VOICE REFINER (HUMANIZER LAYER)
    // ══════════════════════════════════════════════════════════════════════════
    const pass2System = `You are an elite Senior Human Editor (ex-Bloomberg, Wired, Financial Times).
Your job is to HUMANtransfer the provided draft into an authentic, deeply engaging, human-written masterpiece.

CRITICAL HUMANIZATION RULES:
1. BAN ALL AI CLICHÉS: Delete words like "delve into", "testament to", "tapestry", "in today's digital landscape", "furthermore", "moreover", "vital role", "in conclusion".
2. BURSTINESS & PERPLEXITY: Vary sentence lengths dramatically. Mix punchy 3-to-5 word sentences with deep analytical breakdowns. Avoid robotic rhythm.
3. AUTHENTIC VOICE: Write with confident practitioner nuance ("When we tested this in production...", "Here is the trap 90% of beginners fall into...", "Let's be blunt:").
4. ZERO HALLUCINATION: Preserve all core technical accuracy, tables, markdown structure, and factual anchors.
5. GEO OPTIMIZED: The first 80 words must provide a direct, crystal-clear 50-word answer to search intent.

Return ONLY a valid JSON object with these exact keys:
{
  "article": "The full humanized markdown article",
  "metaDescription": "SEO meta description under 155 characters written with human punchiness",
  "tweetThread": [
    "Tweet 1 (Viral Hook)",
    "Tweet 2 (Core Counter-Intuitive Truth)",
    "Tweet 3 (Key Breakdown)",
    "Tweet 4 (Real-world Data/Gotcha)",
    "Tweet 5 (Actionable Checklist)",
    "Tweet 6 (CTA link)"
  ],
  "humanizationNotes": "Brief summary of stylistic improvements made (e.g. burstiness injected, AI tropes removed)"
}`;

    const pass2Res = await callOpenAIWithRetry(openai, {
      model: selectedModel,
      temperature: 0.85, // Higher temperature for natural human flair
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: pass2System },
        { role: 'user', content: `Humanize and elevate this article draft:\n\n${rawDraft}` },
      ],
    });

    totalInputTokens += pass2Res.usage?.prompt_tokens ?? 0;
    totalOutputTokens += pass2Res.usage?.completion_tokens ?? 0;

    const parsed = JSON.parse(pass2Res.choices[0]?.message?.content ?? '{}') as {
      article?: string;
      metaDescription?: string;
      tweetThread?: string[];
      humanizationNotes?: string;
    };

    if (!parsed.article) {
      throw new Error('Humanizer pass failed to produce article content');
    }

    // 5. Update token usage
    const callCost = calcCost(totalInputTokens, totalOutputTokens);
    usage.tokensUsed += totalInputTokens + totalOutputTokens;
    usage.estimatedCost = parseFloat((usage.estimatedCost + callCost).toFixed(4));
    await writeTokenUsage(usage);

    return NextResponse.json({
      success: true,
      data: {
        blog: parsed.article,
        metaDescription: parsed.metaDescription ?? '',
        tweets: parsed.tweetThread ?? [],
        humanizationNotes: parsed.humanizationNotes ?? 'AI clichés purged; human burstiness & practitioner voice applied.',
        tokensUsed: totalInputTokens + totalOutputTokens,
        estimatedCost: callCost,
        budgetRemaining: parseFloat(Math.max(0, budgetUsd - usage.estimatedCost).toFixed(4)),
      },
    });
  } catch (err: unknown) {
    console.error('[API /api/generate] Error:', err);
    return NextResponse.json(
      { error: (err as Error).message ?? 'Generation failed', code: 'GENERATION_ERROR' },
      { status: 500 },
    );
  }
}
