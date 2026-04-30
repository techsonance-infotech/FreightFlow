const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.chartOfAccount.findMany({
    where: { type: 'liability' },
    take: 20
  });
  console.log('Liability Accounts:', accounts.map(a => ({ name: a.name, type: a.type, code: a.code })));

  const journals = await prisma.journalEntry.findMany({
    where: { voucherType: 'purchase' },
    take: 5,
    include: { lines: { include: { account: true } } }
  });
  console.log('Purchase Journals:', JSON.stringify(journals, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
