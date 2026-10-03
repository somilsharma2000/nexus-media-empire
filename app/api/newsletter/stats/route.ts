import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

export async function GET() {
  try {
    const raw = await fs.readFile(SUBSCRIBERS_PATH, 'utf-8').catch(() => '[]');
    const subscribers = JSON.parse(raw);
    return NextResponse.json({
      count: subscribers.length,
      recent: subscribers.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ count: 0, recent: [] });
  }
}
