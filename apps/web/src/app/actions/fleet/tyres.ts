'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getTyres() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const tyres = await prisma.vehicleTyre.findMany({
    where: { companyId: session.user.companyId },
    include: {
      vehicle: {
        select: { regNo: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return JSON.parse(JSON.stringify(tyres));
}

export async function addTyre(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.vehicleTyre.create({
    data: {
      ...data,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      purchaseCost: parseInt(data.purchaseCost) || 0,
      purchaseDate: new Date(data.purchaseDate),
    }
  });

  revalidatePath('/dashboard/fleet/tyres');
  return { success: true };
}

export async function updateTyreStatus(tyreId: string, status: string, vehicleId?: string, position?: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.vehicleTyre.update({
    where: { id: tyreId, companyId: session.user.companyId },
    data: {
      status,
      vehicleId: vehicleId || null,
      position: position || null,
      mountingDate: status === 'mounted' ? new Date() : null,
    }
  });

  revalidatePath('/dashboard/fleet/tyres');
  return { success: true };
}
