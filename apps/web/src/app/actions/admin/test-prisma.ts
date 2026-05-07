import { prisma } from '@freightflow/db';

async function checkPrisma() {
  console.log('Prisma models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
}

checkPrisma();
