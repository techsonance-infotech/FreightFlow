'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function activateLicense(licenseKey: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error('Unauthorized');
    }

    const { tenantId } = session.user;

    const keyHash = crypto.createHash('sha256').update(licenseKey.trim().toUpperCase()).digest('hex');

    const validKey = await prisma.licenseKey.findFirst({
      where: {
        keyHash,
        tenantId,
      }
    });

    if (!validKey) {
      throw new Error('Invalid or unrecognized License Key.');
    }

    if (new Date(validKey.expiresAt) < new Date()) {
      throw new Error('This License Key has expired.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          plan: validKey.plan,
          licenseExpiresAt: validKey.expiresAt,
          status: 'active',
        }
      });

      await tx.licenseKey.delete({
        where: { id: validKey.id }
      });
      
      await tx.auditLog.create({
        data: {
          tenantId,
          companyId: session.user.companyId || tenantId, // Fallback if no company assigned yet
          userId: session.user.id,
          action: 'license_activated',
          entityType: 'Tenant',
          entityId: tenantId,
          changes: { plan: validKey.plan, expiresAt: validKey.expiresAt }
        }
      });
    });

    revalidatePath('/dashboard', 'layout');

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to activate license.');
  }
}
