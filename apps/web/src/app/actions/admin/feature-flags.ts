'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function getFeatureFlags() {
  return await prisma.featureFlag.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function toggleFeatureFlag(flagId: string, enabled: boolean) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const flag = await prisma.featureFlag.update({
    where: { id: flagId },
    data: { globalEnabled: enabled }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: `FEATURE_FLAG_${enabled ? 'ENABLED' : 'DISABLED'}`,
      payload: { flagId, name: flag.name }
    }
  });

  revalidatePath('/admin/features');
  return flag;
}

export async function updateFlagStatus(flagId: string, status: 'disabled' | 'beta' | 'ga') {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const flag = await prisma.featureFlag.update({
    where: { id: flagId },
    data: { status }
  });

  revalidatePath('/admin/features');
  return flag;
}

export async function addTenantToBeta(flagId: string, tenantId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
  if (!flag) throw new Error('Flag not found');

  const updatedFlag = await prisma.featureFlag.update({
    where: { id: flagId },
    data: { 
      tenantIds: { set: Array.from(new Set([...flag.tenantIds, tenantId])) }
    }
  });

  revalidatePath('/admin/features');
  return updatedFlag;
}
