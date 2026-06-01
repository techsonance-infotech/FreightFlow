import { prisma } from './src';
import bcrypt from 'bcryptjs';

async function main() {
  const admins = await prisma.platformAdmin.findMany();
  console.log('Platform Admins:');
  console.log(admins);

  if (admins.length === 0) {
    console.log('No platform admins found. Creating default platform admin...');
    const email = 'hello.freightflow@gmail.com';
    const password = 'TechSonance1711!@#$';
    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.platformAdmin.create({
      data: {
        email,
        passwordHash,
        role: 'super_admin'
      }
    });
    console.log('✅ Created default platform admin:', newAdmin.email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
