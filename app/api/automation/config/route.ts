import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'automation_config.json');

export async function GET() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read automation config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save automation config' }, { status: 500 });
  }
}
