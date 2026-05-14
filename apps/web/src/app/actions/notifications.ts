'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getMyNotifications() {
  const session = await getSession();
  if (!session || !session.user) return [];

  return prisma.systemNotification.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null, tenantId: session.user.tenantId },
        { userId: null, tenantId: null } // Global broadcasts
      ],
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  await prisma.systemNotification.update({
    where: { id },
    data: { isRead: true }
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  await prisma.systemNotification.updateMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null, tenantId: session.user.tenantId }
      ],
      isRead: false
    },
    data: { isRead: true }
  });

  revalidatePath('/dashboard');
  return { success: true };
}
