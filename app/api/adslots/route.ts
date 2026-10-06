import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

const DATA_FILE = path.join(process.cwd(), 'data', 'adslots.json');

function readSlots() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSlots(slots: unknown[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(slots, null, 2));
}

// GET /api/adslots — return all slots
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/killswitch')) {
    return NextResponse.json({ error: 'Use PATCH for killswitch' }, { status: 405 });
  }

  return NextResponse.json(readSlots());
}

// POST /api/adslots — create new slot
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const slots = readSlots();
    const newSlot = {
      id: `slot-${Date.now()}`,
      name: body.name || 'Unnamed Slot',
      siteTargeting: body.siteTargeting || 'all',
      placement: body.placement || 'midFeed',
      type: body.type || 'house',
      headline: body.headline || '',
      description: body.description || '',
      ctaUrl: body.ctaUrl || '',
      adCode: body.adCode || '',
      weight: typeof body.weight === 'number' ? body.weight : 1,
      priority: typeof body.priority === 'number' ? body.priority : 1,
      isActive: body.isActive !== undefined ? body.isActive : true,
      requiresDisclosure: body.requiresDisclosure || false,
      frequencyCapPerUser: typeof body.frequencyCapPerUser === 'number' ? body.frequencyCapPerUser : 0,
    };
    slots.push(newSlot);
    writeSlots(slots);
    return NextResponse.json(newSlot, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 });
  }
}

// PUT /api/adslots — update existing slot by id
export async function PUT(request: NextRequest) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const slots = readSlots();
    const idx = slots.findIndex((s: { id: string }) => s.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    slots[idx] = { ...slots[idx], ...body };
    writeSlots(slots);
    return NextResponse.json(slots[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
  }
}

// DELETE /api/adslots — delete slot by id
export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id query param required' }, { status: 400 });
    }
    const slots = readSlots();
    const filtered = slots.filter((s: { id: string }) => s.id !== id);
    if (filtered.length === slots.length) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    writeSlots(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }
}
