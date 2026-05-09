import { prisma } from '../packages/db/src/index';

async function test() {
  try {
    const count = await prisma.revenueSnapshot.count();
    console.log('RevenueSnapshot count:', count);
  } catch (err) {
    console.error('Error:', err);
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  }
}

test();
