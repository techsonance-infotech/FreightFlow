'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function sendAdminMessage(requestId: string, text: string) {
  try {
    const session = await getAdminSession();
    if (!session) throw new Error('Unauthorized');

    await prisma.supportMessage.create({
      data: {
        requestId,
        adminId: session.id,
        message: text.trim(),
        isAction: false,
      }
    });

    await prisma.licenseRequest.update({
      where: { id: requestId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/admin/support/${requestId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateAndSendLicense({
  requestId,
  tenantId,
  plan,
  years,
  maxUsers,
  maxVehicles
}: any) {
  try {
    const session = await getAdminSession();
    if (!session) throw new Error('Unauthorized');

    // 1. Generate a human-readable license key
    const rawKey = `FF-${plan.toUpperCase().slice(0, 3)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // 2. Hash the key for secure storage
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 3. Calculate expiry
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    await prisma.$transaction(async (tx) => {
      // 4. Create the license key record
      await tx.licenseKey.create({
        data: {
          tenantId,
          keyHash,
          plan,
          maxUsers,
          maxVehicles,
          expiresAt
        }
      });

      // 5. Create a system message with the key
      await tx.supportMessage.create({
        data: {
          requestId,
          adminId: session.id,
          message: `NEW LICENSE ISSUED: ${rawKey}. Please use this key on the activation screen. Valid until ${expiresAt.toLocaleDateString()}.`,
          isAction: true,
        }
      });

      // 6. Update request status
      await tx.licenseRequest.update({
        where: { id: requestId },
        data: { status: 'approved' }
      });

      // 7. Platform Audit Log
      await tx.auditLogPlatform.create({
        data: {
          adminId: session.id,
          action: 'license_issued',
          targetTenantId: tenantId,
          payload: { plan, years, maxUsers, maxVehicles, requestId }
        }
      });
    });

    revalidatePath(`/admin/support/${requestId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
