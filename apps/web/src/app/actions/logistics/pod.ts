'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function submitPod(data: {
  orderId: string;
  receiverName: string;
  deliveredAt: Date;
  photoUrl?: string;
  signatureUrl?: string;
  lat?: number;
  lng?: number;
}) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const { orderId, receiverName, deliveredAt, photoUrl, signatureUrl, lat, lng } = data;

  await prisma.$transaction(async (tx) => {
    // 1. Create POD Record
    await tx.podRecord.create({
      data: {
        companyId: session.user.companyId!,
        orderId,
        receiverName,
        deliveredAt,
        photoUrl,
        signatureUrl,
        geoLat: lat,
        geoLng: lng,
      },
    });

    // 2. Update Order Status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'delivered' },
    });

    // 3. Log Status Change
    await tx.lrStatusLog.create({
      data: {
        companyId: session.user.companyId!,
        orderId,
        status: 'delivered',
        notes: `POD submitted by ${session.user.name}. Received by ${receiverName}. Location: Delivery Point`,
        updatedBy: session.user.id,
      },
    });
  });

  revalidatePath('/dashboard/trips/pod');
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function verifyPod(orderId: string, status: 'verified' | 'rejected', remarks?: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { 
        status: status === 'verified' ? 'completed' : 'pod_rejected',
      },
    });

    await tx.lrStatusLog.create({
      data: {
        companyId: session.user.companyId!,
        orderId,
        status: status === 'verified' ? 'completed' : 'pod_rejected',
        notes: remarks || `POD ${status} by ${session.user.name}`,
        updatedBy: session.user.id,
      },
    });
  });

  revalidatePath('/dashboard/trips/pod');
  return { success: true };
}
