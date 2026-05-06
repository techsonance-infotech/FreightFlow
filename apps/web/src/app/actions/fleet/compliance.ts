'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getComplianceStats() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const companyId = session.user.companyId;

  const totalDocuments = await prisma.vehicleDocument.count({ where: { companyId } });
  
  const today = new Set([new Date().toISOString().split('T')[0]]);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringSoon = await prisma.vehicleDocument.count({
    where: {
      companyId,
      expiryDate: {
        lte: thirtyDaysFromNow,
        gt: new Date()
      }
    }
  });

  const expired = await prisma.vehicleDocument.count({
    where: {
      companyId,
      expiryDate: {
        lte: new Date()
      }
    }
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { companyId },
    include: {
      vehicleDocuments: true
    }
  });

  return {
    stats: {
      totalDocuments,
      expiringSoon,
      expired,
      complianceRate: totalDocuments > 0 ? Math.round(((totalDocuments - expired) / totalDocuments) * 100) : 100
    },
    vehicles: JSON.parse(JSON.stringify(vehicles))
  };
}

export async function updateVehicleDocument(docId: string, data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.vehicleDocument.update({
    where: { id: docId, companyId: session.user.companyId },
    data: {
      docNo: data.docNo,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
    }
  });

  revalidatePath('/dashboard/fleet/compliance');
  return { success: true };
}
