import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'data', 'social_log.json');

export async function GET() {
  try {
    const raw = await fs.readFile(LOG_PATH, 'utf-8');
    const logs = JSON.parse(raw);
    return NextResponse.json(logs.slice(-25).reverse());
  } catch {
    return NextResponse.json([]);
  }
}
