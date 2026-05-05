import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed System Tenant
  const systemTenantId = '00000000-0000-0000-0000-000000000000';
  await prisma.tenant.upsert({
    where: { id: systemTenantId },
    update: {},
    create: {
      id: systemTenantId,
      name: 'FreightFlow System',
      slug: 'system',
      plan: 'enterprise',
      status: 'active',
    },
  });

  // 2. Seed Super Admin
  const adminEmail = 'hello.freightflow@gmail.com';
  const adminPassword = 'TechSonance1711!@#$';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'super_admin',
    },
    create: {
      tenantId: systemTenantId,
      name: 'Freight Flow',
      email: adminEmail,
      phone: '9173101711',
      passwordHash: hashedPassword,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 2. Seed Demo Tenant ("Shree Shivay Roadlines")
  const tenantSlug = 'shree-shivay-roadlines';
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {},
    create: {
      name: 'Shree Shivay Roadlines',
      slug: tenantSlug,
      plan: 'pro',
      status: 'active',
      licenseExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // +1 year
    },
  });
  console.log(`✅ Demo Tenant created: ${tenant.name}`);

  // 3. Enable Core Modules for Demo Tenant
  const modules = ['mod_lr_management', 'mod_trip_management', 'mod_core_accounting', 'mod_fleet'];
  for (const mod of modules) {
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleKey: {
          tenantId: tenant.id,
          moduleKey: mod,
        },
      },
      update: { isEnabled: true },
      create: {
        tenantId: tenant.id,
        moduleKey: mod,
        isEnabled: true,
      },
    });
  }
  console.log(`✅ Modules enabled for Demo Tenant`);

  // 4. Seed Demo Company
  const company = await prisma.company.upsert({
    // We don't have a unique constraint on company name alone across DB, but we can query first
    where: { id: '00000000-0000-0000-0000-000000000000' }, // Dummy UUID to force create if not found, actually let's just findFirst
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Shree Shivay Roadlines - HQ',
      gstin: '27AADCS1234A1Z5',
      pan: 'AADCS1234A',
      address: 'Transport Nagar, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      phone: '9876543210',
      email: 'info@shreeshivay.com',
      isActive: true,
    },
  }).catch(async (e) => {
    // If we fail on unique or something, just find existing
    const existing = await prisma.company.findFirst({
      where: { tenantId: tenant.id, name: 'Shree Shivay Roadlines - HQ' },
    });
    if (existing) return existing;
    throw e;
  });
  console.log(`✅ Demo Company created: ${company.name}`);

  // 5. User will be seeded automatically by Supabase Auth triggers or can be added via the App's Registration flow.
  // We'll create a placeholder user record anyway
  const dummyAuthUid = '00000000-0000-0000-0000-000000000001';
  const user = await prisma.user.upsert({
    where: { authUid: dummyAuthUid },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      authUid: dummyAuthUid,
      name: 'Demo Admin',
      email: 'demo@shreeshivay.com',
      role: 'tenant_owner',
      isActive: true,
    },
  });
  console.log(`✅ Demo User created: ${user.name}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
