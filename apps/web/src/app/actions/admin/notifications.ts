'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function broadcastNotification(data: {
  title: string;
  message: string;
  type: 'info' | 'promotional' | 'alert' | 'maintenance' | 'license';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target: 'ALL' | 'UNLICENSED' | 'NEAR_EXPIRY';
  link?: string;
  expiresInDays?: number;
}) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized access to administrative orchestration');
  }

  const expiresAt = data.expiresInDays 
    ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000) 
    : null;

  let targetUserIds: string[] = [];

  if (data.target === 'ALL') {
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map(u => u.id);
  } else if (data.target === 'UNLICENSED') {
    // Tenants without active subscription
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { status: { not: 'active' } },
          { licenseExpiresAt: { lt: new Date() } }
        ]
      },
      include: { users: { select: { id: true } } }
    });
    targetUserIds = tenants.flatMap(t => t.users.map(u => u.id));
  } else if (data.target === 'NEAR_EXPIRY') {
    // Tenants with subscription expiring in < 7 days
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tenants = await prisma.tenant.findMany({
      where: {
        licenseExpiresAt: {
          lte: nextWeek,
          gt: new Date()
        }
      },
      include: { users: { select: { id: true } } }
    });
    targetUserIds = tenants.flatMap(t => t.users.map(u => u.id));
  }

  // Create notifications in bulk (or global if possible, but per-user allows read tracking)
  await prisma.systemNotification.createMany({
    data: targetUserIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority,
      link: data.link,
      expiresAt,
    }))
  });

  revalidatePath('/dashboard');
  return { success: true, count: targetUserIds.length };
}

export async function getBroadcastHistory() {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') throw new Error('Unauthorized');

  // Group by title and message to show "broadcasts" instead of individual notifications
  const notifications = await prisma.systemNotification.findMany({
    orderBy: { createdAt: 'desc' },
    distinct: ['title', 'message'],
    take: 10
  });

  return notifications;
}
