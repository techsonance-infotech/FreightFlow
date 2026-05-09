'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function cloneTenant(tenantId: string, newName: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const sourceTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { modules: true }
  });

  if (!sourceTenant) throw new Error('Source tenant not found');

  // Create new sandbox tenant
  const newTenant = await prisma.tenant.create({
    data: {
      name: `${newName} (Sandbox)`,
      slug: `${sourceTenant.slug}-sandbox-${Math.floor(Math.random() * 1000)}`,
      plan: sourceTenant.plan,
      status: 'active',
      kycStatus: 'verified', // Pre-verified for sandbox
      modules: {
        create: sourceTenant.modules.map(m => ({
          moduleKey: m.moduleKey,
          isEnabled: m.isEnabled
        }))
      }
    }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: 'TENANT_CLONED',
      targetTenantId: newTenant.id,
      payload: { sourceTenantId: tenantId, newTenantId: newTenant.id }
    }
  });

  revalidatePath('/admin/tenants');
  return newTenant;
}

export async function promoteSandbox(tenantId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { 
      name: tenantId.replace(' (Sandbox)', ''),
      status: 'active'
    }
  });

  revalidatePath('/admin/tenants');
  return tenant;
}
