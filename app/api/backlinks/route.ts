import { NextResponse } from 'next/server';
import { getBacklinks, saveBacklink, deleteBacklink } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await getBacklinks();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = {
      id: body.id || `bl-${Date.now()}`,
      platform: body.platform || 'Other',
      url: body.url,
      articleTitle: body.articleTitle || 'General Authority Backlink',
      addedAt: new Date().toISOString(),
      status: 'active',
      clicks: Number(body.clicks) || 0,
      notes: body.notes || '',
    };

    await saveBacklink(newItem);
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

    await deleteBacklink(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete backlink' }, { status: 500 });
  }
}

