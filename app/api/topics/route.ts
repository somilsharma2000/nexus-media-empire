import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TOPICS_PATH = path.join(process.cwd(), 'data', 'topics.json');

async function readTopics(): Promise<any[]> {
  try {
    const raw = await fs.readFile(TOPICS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeTopics(topics: any[]) {
  await fs.writeFile(TOPICS_PATH, JSON.stringify(topics, null, 2));
}

export async function GET() {
  const topics = await readTopics();
  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topics = await readTopics();

    if (body.bulk && Array.isArray(body.topics)) {
      const newItems = body.topics.map((t: any, idx: number) => ({
        id: `top-${Date.now()}-${idx}`,
        topic: typeof t === 'string' ? t.trim() : t.topic,
        niche: body.niche || t.niche || 'news',
        priority: body.priority || t.priority || 'high',
        isActive: true,
        timesUsed: 0,
        lastUsed: null,
      })).filter((item: any) => item.topic.length > 0);

      const updated = [...topics, ...newItems];
      await writeTopics(updated);
      return NextResponse.json({ success: true, count: newItems.length, topics: updated });
    }

    const newTopic = {
      id: `top-${Date.now()}`,
      topic: body.topic,
      niche: body.niche || 'news',
      priority: body.priority || 'medium',
      isActive: body.isActive !== false,
      timesUsed: 0,
      lastUsed: null,
    };

    topics.unshift(newTopic);
    await writeTopics(topics);
    return NextResponse.json({ success: true, topic: newTopic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const topics = await readTopics();
    const idx = topics.findIndex((t) => t.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    topics[idx] = { ...topics[idx], ...body };
    await writeTopics(topics);
    return NextResponse.json({ success: true, topic: topics[idx] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    let topics = await readTopics();
    topics = topics.filter((t) => t.id !== id);
    await writeTopics(topics);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
