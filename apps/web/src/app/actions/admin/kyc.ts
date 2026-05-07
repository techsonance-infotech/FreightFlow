'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function getTenantKyc(tenantId: string) {
  return await prisma.kycDocument.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function verifyKycDocument(documentId: string, status: 'verified' | 'rejected', rejectionNote?: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const document = await prisma.kycDocument.update({
    where: { id: documentId },
    data: { 
      status, 
      rejectionNote,
      verifiedAt: status === 'verified' ? new Date() : null
    },
    include: { tenant: true }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: `KYC_DOCUMENT_${status.toUpperCase()}`,
      targetTenantId: document.tenantId,
      payload: { documentId, type: document.type, rejectionNote }
    }
  });

  // Check if all essential documents are verified to update tenant status
  const allDocs = await prisma.kycDocument.findMany({
    where: { tenantId: document.tenantId }
  });

  const allVerified = allDocs.length > 0 && allDocs.every(d => d.status === 'verified');
  
  if (allVerified) {
    await prisma.tenant.update({
      where: { id: document.tenantId },
      data: { kycStatus: 'verified' }
    });
  } else if (status === 'rejected') {
    await prisma.tenant.update({
      where: { id: document.tenantId },
      data: { kycStatus: 'rejected' }
    });
  }

  revalidatePath(`/admin/tenants/${document.tenantId}`);
  return document;
}
