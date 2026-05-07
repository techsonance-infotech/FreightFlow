import { prisma } from '../packages/db/src/index';

async function test() {
  console.log('--- Prisma Model Keys ---');
  const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log(JSON.stringify(keys, null, 2));
}

test();
