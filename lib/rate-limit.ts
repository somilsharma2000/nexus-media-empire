import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    const valid = record.timestamps.filter((ts) => now - ts < 120000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      record.timestamps = valid;
    }
  });
}, 300000);

/**
 * IP-based sliding-window rate limiter
 * @param req Request object
 * @param limit Max allowed requests within window
 * @param windowMs Window in milliseconds (default 60000ms = 1 min)
 * @returns { success: boolean, remaining: number, resetMs: number }
 */
export function checkRateLimit(
  req: Request | NextRequest,
  limit = 10,
  windowMs = 60000
): { success: boolean; remaining: number; resetMs: number } {
  // Extract client IP from standard proxy headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';

  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Filter timestamps within current window
  const windowStart = now - windowMs;
  const recentTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (recentTimestamps.length >= limit) {
    const oldest = recentTimestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { success: false, remaining: 0, resetMs };
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: recentTimestamps });

  return {
    success: true,
    remaining: limit - recentTimestamps.length,
    resetMs: windowMs,
  };
}

export function rateLimitExceededResponse(resetMs: number) {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please retry in ${Math.ceil(resetMs / 1000)} seconds.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetMs / 1000)),
      },
    }
  );
}
