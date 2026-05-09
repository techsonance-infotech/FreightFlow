'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function toggleTenantStatus(tenantId: string, currentStatus: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

  await prisma.$transaction(async (tx) => {
    // 1. Update Tenant Status
    await tx.tenant.update({
      where: { id: tenantId },
      data: { status: newStatus }
    });

    // 2. Log Action
    await tx.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: newStatus === 'suspended' ? 'suspend_tenant' : 'reactivate_tenant',
        targetTenantId: tenantId,
        payload: { previousStatus: currentStatus, newStatus }
      }
    });
  });

  revalidatePath('/admin/tenants');
  revalidatePath('/admin/dashboard');
  return { success: true, status: newStatus };
}
