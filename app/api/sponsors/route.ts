import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SPONSORS_PATH = path.join(process.cwd(), 'data', 'sponsors.json');

async function getSponsors() {
  try {
    const raw = await fs.readFile(SPONSORS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSponsors(sponsors: any[]) {
  await fs.mkdir(path.dirname(SPONSORS_PATH), { recursive: true });
  await fs.writeFile(SPONSORS_PATH, JSON.stringify(sponsors, null, 2));
}

export async function GET() {
  const sponsors = await getSponsors();
  return NextResponse.json(sponsors);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sponsors = await getSponsors();
    const newSponsor = {
      id: `sp-${Date.now()}`,
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
    sponsors.unshift(newSponsor);
    await saveSponsors(sponsors);
    return NextResponse.json({ success: true, sponsor: newSponsor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let sponsors = await getSponsors();
    sponsors = sponsors.map((s: any) => (s.id === body.id ? { ...s, ...body } : s));
    await saveSponsors(sponsors);
    return NextResponse.json({ success: true, sponsors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    let sponsors = await getSponsors();
    sponsors = sponsors.filter((s: any) => s.id !== id);
    await saveSponsors(sponsors);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
