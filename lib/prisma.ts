import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient | null {
  if (typeof window !== 'undefined') return null;

  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL === '1') {
      throw new Error('[Prisma] Missing DATABASE_URL environment variable in production');
    }
    return null;
  }

  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (err) {
      console.error('[Prisma] Fatal client initialization error:', err);
      if (process.env.VERCEL === '1') {
        throw err;
      }
      return null;
    }
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
export default prisma;
