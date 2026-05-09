'use server';

import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';

export async function getTenantSettings() {
  const session = await getSession();
  if (!session || !session.user || !session.user.tenantId) {
    throw new Error('Unauthorized');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { settings: true }
  });

  if (!tenant) throw new Error('Tenant not found');

  return tenant.settings || {};
}

export async function updateTenantSettings(newSettings: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.tenantId) {
    throw new Error('Unauthorized');
  }

  // Only allow Admin or Business Owner to update tenant settings
  if (session.user.role !== 'tenant_owner' && session.user.role !== 'fleet_owner' && session.user.role !== 'super_admin') {
    throw new Error('Insufficient permissions to update business settings');
  }

  // Fetch current to merge
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { settings: true }
  });

  const currentSettings = (tenant?.settings as any) || {};
  const mergedSettings = { ...currentSettings, ...newSettings };

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: { settings: mergedSettings }
  });

  // Revalidate routes that might depend on these settings
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings/business');
  revalidatePath('/dashboard/settings/business/preferences');
  revalidatePath('/dashboard/settings/business/integrations');
  revalidatePath('/dashboard/settings/business/data');

  return { success: true };
}
