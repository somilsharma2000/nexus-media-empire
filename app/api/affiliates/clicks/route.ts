import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const clickLogPath = path.join(process.cwd(), 'data', 'click_log.json');

interface ClickEntry {
  slug: string;
  affiliateUrl: string;
  timestamp: string;
}

async function readLog(): Promise<ClickEntry[]> {
  try {
    const raw = await fs.readFile(clickLogPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET() {
  const log = await readLog();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countsBySlug: Record<string, number> = {};
  for (const entry of log) {
    if (new Date(entry.timestamp) >= todayStart) {
      countsBySlug[entry.slug] = (countsBySlug[entry.slug] || 0) + 1;
    }
  }

  return NextResponse.json(countsBySlug);
}
