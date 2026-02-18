import { PrismaClient } from '@prisma/client';

// Double cast is required because `globalThis` has no index signature for
// arbitrary properties.  This is a widely-used singleton pattern recommended
// by the Prisma docs to prevent exhausting database connections during
// development hot-reloads.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
