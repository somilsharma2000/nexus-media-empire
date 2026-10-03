import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const BACKLINKS_PATH = path.join(process.cwd(), 'data', 'backlinks.json');

async function readBacklinks(): Promise<any[]> {
  try {
    const raw = await fs.readFile(BACKLINKS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeBacklinks(items: any[]) {
  await fs.writeFile(BACKLINKS_PATH, JSON.stringify(items, null, 2));
}

export async function GET() {
  const items = await readBacklinks();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = await readBacklinks();

    const newItem = {
      id: `bl-${Date.now()}`,
      platform: body.platform || 'Other',
      url: body.url,
      articleTitle: body.articleTitle || 'General Authority Backlink',
      addedAt: new Date().toISOString(),
      status: 'active',
      clicks: Number(body.clicks) || 0,
      notes: body.notes || '',
    };

    items.unshift(newItem);
    await writeBacklinks(items);
    return NextResponse.json({ success: true, backlink: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add backlink' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    let items = await readBacklinks();
    items = items.filter((b) => b.id !== id);
    await writeBacklinks(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete backlink' }, { status: 500 });
  }
}
