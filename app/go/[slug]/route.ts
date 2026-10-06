import { NextResponse } from 'next/server';
import { getAffiliateLinks, logAffiliateClick } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;

    // Look up the real affiliate URL from the data layer
    const links = await getAffiliateLinks();
    const link = links.find((l: any) => l.slug === slug && l.isActive);

    if (!link) {
      // Unknown slug — redirect home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Log the click in database & local storage
    await logAffiliateClick(slug, link.affiliateUrl, link.niche);

    // Google Compliance: 307 temporary redirect with X-Robots-Tag to prevent search engine indexing
    return NextResponse.redirect(link.affiliateUrl, {
      status: 307,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Affiliate Redirect Error]:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
