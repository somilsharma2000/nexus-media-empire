import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'adslots.json');

export async function GET() {
  try {
    const slots = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    return NextResponse.json(slots);
  } catch {
    return NextResponse.json([]);
  }
}
