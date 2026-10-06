import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendTelegramAlert } from '@/lib/telegram';
import {
  getArticleById,
  saveArticle,
  saveQALog,
  getQAConfig,
  updateTokenUsage,
} from '@/lib/data-layer';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ─── Pricing constants (gpt-4o-mini) ─────────────────────────────────────────
const INPUT_COST_PER_M  = 0.150;
const OUTPUT_COST_PER_M = 0.600;

function calcCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_M +
         (outputTokens / 1_000_000) * OUTPUT_COST_PER_M;
}

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

  // 3. Load QA config from database
  const config = await getQAConfig();

  // 4. Call AI Reviewer
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

Approve if average >= ${config.approveThreshold || 8}. Revise if ${config.reviseThreshold || 5}-${(config.approveThreshold || 8) - 1}. Reject if below ${config.reviseThreshold || 5}.`;

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

  // 6. Track tokens in database
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;
  const cost = calcCost(promptTokens, completionTokens);
  await updateTokenUsage(promptTokens + completionTokens, cost);

  // 7. Update article in DB and save QA Log
  if (articleId) {
    const article = await getArticleById(articleId);

    if (article) {
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

      await saveArticle(article);
    }

    // Persist QA Log row to PostgreSQL
    await saveQALog({
      articleId: String(articleId),
      verdict: verdict.verdict,
      averageScore: verdict.averageScore,
      scores: verdict.scores,
      rejectionReason: verdict.rejectionReason,
      revisionInstructions: verdict.revisionInstructions,
      model: selectedModel,
    });
  }

  // 8. Return verdict
  return NextResponse.json({ success: true, verdict });
}
