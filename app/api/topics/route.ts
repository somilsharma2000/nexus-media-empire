import { NextResponse } from 'next/server';
import { getTopics, saveTopic, deleteTopic } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const topics = await getTopics();
  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.bulk && Array.isArray(body.topics)) {
      const created = [];
      for (let idx = 0; idx < body.topics.length; idx++) {
        const t = body.topics[idx];
        const topicText = typeof t === 'string' ? t.trim() : t.topic;
        if (!topicText) continue;
        const newTopic = {
          id: `top-${Date.now()}-${idx}`,
          topic: topicText,
          niche: body.niche || t.niche || 'news',
          priority: body.priority || t.priority || 'high',
          isActive: true,
          timesUsed: 0,
          lastUsed: null,
        };
        await saveTopic(newTopic);
        created.push(newTopic);
      }

      const all = await getTopics();
      return NextResponse.json({ success: true, count: created.length, topics: all });
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

    await saveTopic(newTopic);
    return NextResponse.json({ success: true, topic: newTopic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const topics = await getTopics();
    const existing = topics.find((t) => t.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const updated = { ...existing, ...body };
    await saveTopic(updated);
    return NextResponse.json({ success: true, topic: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const success = await deleteTopic(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
