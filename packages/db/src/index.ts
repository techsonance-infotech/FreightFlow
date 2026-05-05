import { PrismaClient } from './generated/client';
import path from 'path';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Explicitly reference the engines for Vercel's NFT tracer
// path.join(__dirname, './generated/client/libquery_engine-rhel-openssl-1.0.x.so.node')
// path.join(__dirname, './generated/client/libquery_engine-rhel-openssl-3.0.x.so.node')

export * from './generated/client';
export default prisma;
