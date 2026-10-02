import { NextResponse } from 'next/server';

export async function GET() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'pub-0000000000000000';
  
  // Standard ads.txt format for AdSense
  const adsTxt = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0`;
  
  return new NextResponse(adsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
