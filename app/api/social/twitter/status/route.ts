import { NextResponse } from 'next/server';

export async function GET() {
  const configured = !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_SECRET
  );

  return NextResponse.json({
    platform: 'Twitter / X',
    configured,
    status: configured ? 'Active' : 'Unconfigured',
    handle: configured ? '@thetrendmatrix' : null,
  });
}
