import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'monetization.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    return NextResponse.json({ activeAd: null });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update monetization rules" }, { status: 500 });
  }
}
