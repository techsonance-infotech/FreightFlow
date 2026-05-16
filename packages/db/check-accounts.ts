import { prisma } from './src';

async function main() {
  const accounts = await prisma.account.findMany({
    where: {
      OR: [
        { name: { contains: 'GST', mode: 'insensitive' } },
        { name: { contains: 'Tax', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Tax related accounts:');
  console.table(accounts.map(a => ({ id: a.id, name: a.name, type: a.type, code: a.code })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
