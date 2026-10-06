import { NextResponse } from 'next/server';
import { getSponsors, saveSponsor, deleteSponsor } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sponsors = await getSponsors();
  return NextResponse.json(sponsors);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newSponsor = {
      id: body.id || `sp-${Date.now()}`,
      brandName: body.brandName || "New Sponsor",
      headline: body.headline || "",
      ctaText: body.ctaText || "Learn More →",
      ctaUrl: body.ctaUrl || "#",
      placement: body.placement || "header_takeover",
      niche: body.niche || "all",
      cpm: Number(body.cpm) || 45.0,
      impressionsDelivered: 0,
      active: body.active !== undefined ? body.active : true,
      tier: body.tier || "niche_exclusive",
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
    await saveSponsor(newSponsor);
    return NextResponse.json({ success: true, sponsor: newSponsor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const updated = await saveSponsor(body);
    return NextResponse.json({ success: true, sponsor: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await deleteSponsor(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

