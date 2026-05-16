import { prisma } from './packages/db/src/index';

async function main() {
  console.log('Prisma keys:', Object.keys(prisma));
}

main().catch(console.error);
