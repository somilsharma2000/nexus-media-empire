// Safe Database & Prisma Client Wrapper
// Designed for production compatibility across serverless edge & Node environments

let prismaInstance: any = null;

export function getPrisma() {
  if (typeof window !== 'undefined') return null;
  if (!process.env.DATABASE_URL) return null;

  if (!prismaInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient } = require('@prisma/client');
      const globalForPrisma = globalThis as unknown as { prismaInstance?: any };

      if (globalForPrisma.prismaInstance) {
        prismaInstance = globalForPrisma.prismaInstance;
      } else {
        prismaInstance = new PrismaClient({
          log: ['error'],
        });
        globalForPrisma.prismaInstance = prismaInstance;
      }
    } catch (e) {
      console.warn('[Prisma] Client initialization error:', e);
      return null;
    }
  }
  return prismaInstance;
}

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) return undefined;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
