import { NextResponse } from 'next/server';
import { generateHermesV3Package, HermesV3Input } from '@/lib/hermes-v3-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HermesV3Input;

    if (!body.topic) {
      return NextResponse.json(
        { error: 'Field "topic" is required to generate Hermes v3.0 schema package' },
        { status: 400 }
      );
    }

    const packageData = generateHermesV3Package(body);

    return NextResponse.json({
      success: true,
      schemaVersion: 'HERMES_v3.0',
      data: packageData,
    });
  } catch (err: any) {
    console.error('[HERMES v3.0 API ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate Hermes v3.0 package' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Demo Hermes v3.0 payload for verification
  const demo = generateHermesV3Package({
    topic: 'Autonomous Multi-Agent Media Engines in 2026',
    niche: 'news',
    campaignGoal: 'article_research',
  });

  return NextResponse.json({
    success: true,
    schemaVersion: 'HERMES_v3.0',
    description: 'Hermes Autonomous Operator System v3.0 JSON Schema Endpoint',
    demo,
  });
}
