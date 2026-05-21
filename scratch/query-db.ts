import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Querying DB ---');
  const tickets = await prisma.supportTicket.findMany({
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true, email: true } }
    }
  });
  console.log('Tickets count:', tickets.length);
  console.log('Tickets:', JSON.stringify(tickets, null, 2));

  const licenseReqs = await prisma.licenseRequest.findMany({
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true, email: true } }
    }
  });
  console.log('License Requests count:', licenseReqs.length);
  console.log('License Requests:', JSON.stringify(licenseReqs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
