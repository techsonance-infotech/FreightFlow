'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function approveLicenseRequest(requestId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const request = await prisma.licenseRequest.findUnique({
    where: { id: requestId },
    include: { tenant: true }
  });

  if (!request) throw new Error('Request not found');

  // Define limits based on plan
  const planDNA: Record<string, { maxUsers: number, maxVehicles: number }> = {
    'starter': { maxUsers: 2, maxVehicles: 5 },
    'pro': { maxUsers: 10, maxVehicles: 25 },
    'enterprise': { maxUsers: 100, maxVehicles: 1000 },
  };

  const limits = planDNA[request.planType.toLowerCase()] || planDNA['starter'];

  // Generate a hashed license key
  const keyRaw = `FF-${request.tenantId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(keyRaw).digest('hex');

  // Transaction: Approve request, Update tenant, Create LicenseKey
  await prisma.$transaction([
    prisma.licenseRequest.update({
      where: { id: requestId },
      data: { status: 'approved' }
    }),
    prisma.tenant.update({
      where: { id: request.tenantId },
      data: { 
        plan: request.planType,
        licenseKey: keyHash,
        licenseExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    }),
    prisma.licenseKey.create({
      data: {
        tenantId: request.tenantId,
        keyHash: keyHash,
        plan: request.planType,
        maxUsers: limits.maxUsers,
        maxVehicles: limits.maxVehicles,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: 'LICENSE_FULFILLMENT_APPROVED',
        targetTenantId: request.tenantId,
        payload: { requestId, plan: request.planType, keyHash: keyHash.slice(0, 8) + '...' }
      }
    })
  ]);

  revalidatePath('/admin/licenses');
  return { success: true };
}

export async function revokeLicense(tenantId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.$transaction([
    prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        status: 'suspended',
        licenseKey: null,
        licenseExpiresAt: new Date()
      }
    }),
    prisma.licenseKey.deleteMany({
      where: { tenantId }
    }),
    prisma.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: 'LICENSE_REVOCATION_EMERGENCY',
        targetTenantId: tenantId,
        payload: { timestamp: new Date().toISOString() }
      }
    })
  ]);

  revalidatePath('/admin/licenses');
  revalidatePath('/admin/tenants');
  return { success: true };
}
