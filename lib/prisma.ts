// Safe Database & Prisma Client Wrapper
// Designed for production compatibility across serverless edge & Node environments

let prismaInstance: any = null;

export function getPrisma() {
  if (typeof window !== 'undefined') return null;
  if (!process.env.DATABASE_URL) return null;

  if (!prismaInstance) {
    try {
      // Dynamic import to prevent build-time crashes if Prisma client is ungenerated
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient } = require('@prisma/client');
      prismaInstance = new PrismaClient({
        log: ['error'],
      });
    } catch (e) {
      console.warn('[Prisma] Client initialization deferred until database migration:', e);
      return null;
    }
  }
  return prismaInstance;
}

export const prisma = getPrisma();
export default prisma;
