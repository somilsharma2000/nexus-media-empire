import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDbUrl: string | undefined;
};

export function getPrisma(): PrismaClient | null {
  if (typeof window !== 'undefined') return null;
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (!dbUrl) return null;

  // If the database URL changed at runtime (e.g. saved in Admin Panel), re-instantiate
  if (!globalForPrisma.prisma || globalForPrisma.prismaDbUrl !== dbUrl) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        datasources: {
          db: { url: dbUrl }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      globalForPrisma.prismaDbUrl = dbUrl;
    } catch (err) {
      console.error('[Prisma] Dynamic client initialization error:', err);
      return null;
    }
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
export default prisma;
