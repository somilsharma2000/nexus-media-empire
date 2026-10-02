import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const linksFilePath = path.join(process.cwd(), 'data', 'affiliate_links.json');

interface AffiliateLink {
  id: string;
  name: string;
  slug: string;
  affiliateUrl: string;
  niche: string;
  commissionEstimate: string;
  isActive: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function readLinks(): Promise<AffiliateLink[]> {
  try {
    await fs.mkdir(path.dirname(linksFilePath), { recursive: true });
    const raw = await fs.readFile(linksFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLinks(links: AffiliateLink[]): Promise<void> {
  await fs.writeFile(linksFilePath, JSON.stringify(links, null, 2));
}

export async function GET() {
  const links = await readLinks();
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const body = await request.json();
  const links = await readLinks();

  const newLink: AffiliateLink = {
    id: `aff-${Date.now()}`,
    name: body.name,
    slug: body.slug || slugify(body.name),
    affiliateUrl: body.affiliateUrl,
    niche: body.niche || 'general',
    commissionEstimate: body.commissionEstimate || '',
    isActive: body.isActive !== undefined ? body.isActive : true,
  };

  links.push(newLink);
  await writeLinks(links);
  return NextResponse.json({ success: true, link: newLink });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const links = await readLinks();
  const idx = links.findIndex((l) => l.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  links[idx] = { ...links[idx], ...body };
  await writeLinks(links);
  return NextResponse.json({ success: true, link: links[idx] });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const links = await readLinks();
  const filtered = links.filter((l) => l.id !== id);
  await writeLinks(filtered);
  return NextResponse.json({ success: true });
}
