import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { isProductionEnvironment, bootstrapProductionDatabase } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  const isProd = isProductionEnvironment();

  try {
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const db = getPrisma();

    if (db) {
      // 1. Verify live DB connection with raw ping
      await db.$queryRaw`SELECT 1 as connected`;

      // 2. Ensure database is populated / bootstrap if empty
      const bootstrapStats = await bootstrapProductionDatabase();
      const articleCount = await db.article.count();

      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        dialect: 'postgresql',
        articleCount,
        bootstrap: bootstrapStats,
        production: isProd,
        timestamp,
      });
    }

    if (isProd) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          error: !hasDbUrl
            ? 'DATABASE_URL environment variable is missing in Vercel settings'
            : 'Prisma Client failed to initialize with provided DATABASE_URL',
          diagnostics: {
            hasDatabaseUrl: hasDbUrl,
            urlPrefix: hasDbUrl ? process.env.DATABASE_URL!.slice(0, 12) + '...' : 'none',
          },
          production: true,
          timestamp,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'local_storage',
      dialect: 'file_fallback',
      production: false,
      timestamp,
    });
  } catch (error: any) {
    console.error('[DATABASE HEALTH CHECK ERROR]', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message || 'Database connection error',
        production: isProd,
        timestamp,
      },
      { status: isProd ? 500 : 200 }
    );
  }
}
