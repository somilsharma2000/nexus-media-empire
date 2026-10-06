import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';
import { bootstrapProductionDatabase, isDatabaseConnected } from '@/lib/data-layer';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const isAuth = await verifyAdminAuth(req);
  if (!isAuth) return unauthorizedResponse();

  try {
    const db = getPrisma();
    if (!db || !isDatabaseConnected()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot bootstrap: PostgreSQL database is not connected. Please save a valid DATABASE_URL first.'
        },
        { status: 400 }
      );
    }

    const summary = await bootstrapProductionDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database synchronization completed successfully!',
      summary
    });
  } catch (err: any) {
    console.error('[BOOTSTRAP API ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to bootstrap database'
      },
      { status: 500 }
    );
  }
}
