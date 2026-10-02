import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const linksFilePath = path.join(process.cwd(), 'data', 'affiliate_links.json');
const clickLogPath  = path.join(process.cwd(), 'data', 'click_log.json');

interface AffiliateLink {
  id: string;
  name: string;
  slug: string;
  affiliateUrl: string;
  niche: string;
  commissionEstimate: string;
  isActive: boolean;
}

interface ClickEntry {
  slug: string;
  affiliateUrl: string;
  timestamp: string;
}

async function readLinks(): Promise<AffiliateLink[]> {
  try {
    const raw = await fs.readFile(linksFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function appendClick(entry: ClickEntry): Promise<void> {
  try {
    await fs.mkdir(path.dirname(clickLogPath), { recursive: true });
    let log: ClickEntry[] = [];
    try {
      const raw = await fs.readFile(clickLogPath, 'utf-8');
      log = JSON.parse(raw);
    } catch { /* file not yet created */ }
    log.push(entry);
    await fs.writeFile(clickLogPath, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error('[Affiliate] Failed to log click:', err);
  }
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;

    // Look up the real affiliate URL from the JSON store
    const links = await readLinks();
    const link = links.find((l) => l.slug === slug && l.isActive);

    if (!link) {
      // Unknown slug — redirect home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Log the click
    await appendClick({
      slug,
      affiliateUrl: link.affiliateUrl,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Affiliate Tracking] Click: ${slug} → ${link.affiliateUrl}`);

    return NextResponse.redirect(link.affiliateUrl, 302);
  } catch (error) {
    console.error('[Affiliate Redirect Error]:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
