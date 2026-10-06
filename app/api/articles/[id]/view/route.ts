import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { incrementArticleView } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const rateLimit = checkRateLimit(req, 60, 60000);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetMs);
  }

  try {
    const viewCount = await incrementArticleView(params.id);
    if (viewCount > 0) {
      return NextResponse.json({ success: true, viewCount });
    }
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
  }
}

