import { NextResponse } from 'next/server';

export async function GET() {
  const configured = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
  return NextResponse.json({
    platform: 'Reddit API',
    configured,
    status: configured ? 'Active' : 'Unconfigured',
  });
}
