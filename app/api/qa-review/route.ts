import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { sendTelegramAlert } from '@/lib/telegram';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ─── Pricing constants (gpt-4o-mini) ─────────────────────────────────────────
const INPUT_COST_PER_M  = 0.150;
const OUTPUT_COST_PER_M = 0.600;

// ─── Paths ────────────────────────────────────────────────────────────────────
const ARTICLES_PATH    = path.join(process.cwd(), 'data', 'articles.json');
const TOKEN_USAGE_PATH = path.join(process.cwd(), 'data', 'token_usage.json');
const QA_CONFIG_PATH   = path.join(process.cwd(), 'data', 'qa_config.json');

// ─── Types ────────────────────────────────────────────────────────────────────
interface QAScores {
  factualSoundness: number;
  originality: number;
  readability: number;
  seoStructure: number;
}

interface QAVerdict {
  scores: QAScores;
  averageScore: number;
  factualClaimsToVerify: string[];
  verdict: 'APPROVE' | 'REVISE' | 'REJECT';
  revisionInstructions?: string;
  rejectionReason?: string;
}

interface Article {
  id: number | string;
  title: string;
  category: string;
  status?: string;
  qaStatus?: string;
  qaVerdict?: QAVerdict;
  revisionInstructions?: string;
  [key: string]: unknown;
}

interface TokenUsage {
  month: string;
  tokensUsed: number;
  estimatedCost: number;
}

interface QAConfig {
  approveThreshold: number;
  reviseThreshold: number;
  maxRevisionAttempts: number;
  autoPublishApproved: boolean;
  requireQAForPublish: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function calcCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_M +
         (outputTokens / 1_000_000) * OUTPUT_COST_PER_M;
}

async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function updateTokenUsage(inputTokens: number, outputTokens: number) {
  const usage = await readJSON<TokenUsage>(TOKEN_USAGE_PATH, { month: '', tokensUsed: 0, estimatedCost: 0 });
  const month = currentMonth();
  if (usage.month !== month) {
    usage.month = month;
    usage.tokensUsed = 0;
    usage.estimatedCost = 0;
  }
  usage.tokensUsed   += inputTokens + outputTokens;
  usage.estimatedCost = parseFloat((usage.estimatedCost + calcCost(inputTokens, outputTokens)).toFixed(6));
  await writeJSON(TOKEN_USAGE_PATH, usage);
}

// ─── POST /api/qa-review ──────────────────────────────────────────────────────
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
  const { articleId, content } = body as { articleId: string; content: string };

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  // 3. Load QA config
  const config = await readJSON<QAConfig>(QA_CONFIG_PATH, {
    approveThreshold: 8,
    reviseThreshold: 5,
    maxRevisionAttempts: 1,
    autoPublishApproved: true,
    requireQAForPublish: true,
  });

  // 4. Call OpenAI / NVIDIA
  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `You are a strict, adversarial editorial QA reviewer and fact-checker (ex-editor-in-chief).
Evaluate the article across 5 rigorous dimensions and return ONLY valid JSON:
{
  "scores": {
    "factualSoundness": <1-10>,
    "humanAuthenticity": <1-10>,
    "originality": <1-10>,
    "readability": <1-10>,
    "seoStructure": <1-10>
  },
  "averageScore": <1-10>,
  "factualClaimsToVerify": ["claim 1", "claim 2"],
  "humanTouchNotes": "Specific feedback on tone, burstiness, and lack of AI cliches",
  "verdict": "APPROVE" | "REVISE" | "REJECT",
  "revisionInstructions": "specific instructions if REVISE",
  "rejectionReason": "reason if REJECT"
}

GRADING CRITERIA:
- factualSoundness: Are data points, dates, formulas, and technical steps accurate and verifiable?
- humanAuthenticity: Does it read like an experienced human practitioner? Reject if flooded with robotic AI clichés ("delve", "tapestry", "moreover").
- originality: High information gain and clear structural value vs generic SERP fluff.
- readability: High burstiness (natural sentence length variation) and engaging cadence.
- seoStructure: GEO summary block, clean subheadings, micro-tables.

Approve if average >= ${config.approveThreshold}. Revise if ${config.reviseThreshold}-${config.approveThreshold - 1}. Reject if below ${config.reviseThreshold}.`;

  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completion = await (openai.chat.completions.create as any)(
      {
        model: selectedModel,
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: `Review this article:\n\n${content.substring(0, 8000)}` },
        ],
      },
      { timeout: 60000 },
    ) as OpenAI.Chat.Completions.ChatCompletion;
  } catch (err: unknown) {
    console.error('[qa-review] OpenAI error:', err);
    return NextResponse.json({ error: 'OpenAI request failed', details: String(err) }, { status: 502 });
  }

  // 5. Parse verdict
  const raw = completion.choices[0]?.message?.content ?? '{}';
  let verdict: QAVerdict;
  try {
    verdict = JSON.parse(raw) as QAVerdict;
  } catch {
    return NextResponse.json({ error: 'Failed to parse QA response JSON' }, { status: 502 });
  }

  // 6. Track tokens
  await updateTokenUsage(
    completion.usage?.prompt_tokens     ?? 0,
    completion.usage?.completion_tokens ?? 0,
  );

  // 7. Update articles.json
  if (articleId) {
    const articles = await readJSON<Article[]>(ARTICLES_PATH, []);
    const idx = articles.findIndex(
      (a) => String(a.id) === String(articleId),
    );

    if (idx !== -1) {
      const article = articles[idx];
      article.qaVerdict = verdict;

      if (verdict.verdict === 'APPROVE') {
        article.qaStatus = 'approved';
        if (config.autoPublishApproved) {
          article.status = 'scheduled';
        }
      } else if (verdict.verdict === 'REVISE') {
        article.qaStatus = 'revision_needed';
        article.revisionInstructions = verdict.revisionInstructions;
      } else {
        // REJECT
        article.qaStatus = 'rejected';
        article.status   = 'rejected';

        // Notify admin via Telegram
        await sendTelegramAlert(
          `🚨 QA REJECTED: ${article.title}\n` +
          `Score: ${verdict.averageScore}/10\n` +
          `Reason: ${verdict.rejectionReason ?? 'Below threshold'}\n` +
          `Send /approve_${articleId} or /reject_${articleId}`
        );
      }

      articles[idx] = article;
      await writeJSON(ARTICLES_PATH, articles);
    }
  }

  // 8. Return verdict
  return NextResponse.json({ success: true, verdict });
}
