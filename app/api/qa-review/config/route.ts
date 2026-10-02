import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const QA_CONFIG_PATH = path.join(process.cwd(), 'data', 'qa_config.json');

const DEFAULT_CONFIG = {
  approveThreshold: 8,
  reviseThreshold: 5,
  maxRevisionAttempts: 1,
  autoPublishApproved: true,
  requireQAForPublish: true,
};

async function readConfig() {
  try {
    const raw = await fs.readFile(QA_CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = await request.json();
  const current = await readConfig();
  const merged = { ...current, ...body };

  await fs.mkdir(path.dirname(QA_CONFIG_PATH), { recursive: true });
  await fs.writeFile(QA_CONFIG_PATH, JSON.stringify(merged, null, 2));

  return NextResponse.json({ success: true, config: merged });
}
