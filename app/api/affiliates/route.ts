import { NextResponse } from 'next/server';
import { getAffiliateLinks, saveAffiliateLink, deleteAffiliateLink } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  const links = await getAffiliateLinks();
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newLink = {
    id: `aff-${Date.now()}`,
    name: body.name,
    slug: body.slug || slugify(body.name),
    affiliateUrl: body.affiliateUrl,
    niche: body.niche || 'general',
    commissionEstimate: body.commissionEstimate || '',
    isActive: body.isActive !== undefined ? body.isActive : true,
  };

  await saveAffiliateLink(newLink);
  return NextResponse.json({ success: true, link: newLink });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const links = await getAffiliateLinks();
  const existing = links.find((l) => l.id === body.id);
  if (!existing) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  const updated = { ...existing, ...body };
  await saveAffiliateLink(updated);
  return NextResponse.json({ success: true, link: updated });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await deleteAffiliateLink(id);
  return NextResponse.json({ success: true });
}
