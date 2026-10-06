import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { getAdSlots, saveAdSlot, deleteAdSlot } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

// GET /api/adslots — return all slots
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/killswitch')) {
    return NextResponse.json({ error: 'Use PATCH for killswitch' }, { status: 405 });
  }

  const slots = await getAdSlots();
  return NextResponse.json(slots);
}

// POST /api/adslots — create new slot
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth(request);
  if (!isAuth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const newSlot = {
      id: body.id || `slot-${Date.now()}`,
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
    await saveAdSlot(newSlot);
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
    const updated = await saveAdSlot(body);
    return NextResponse.json(updated);
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
    await deleteAdSlot(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }
}

