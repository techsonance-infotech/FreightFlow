'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function getPlatformConfig() {
  if (!(prisma as any).globalSetting) {
    console.error('Prisma client out of sync: globalSetting model missing');
    return {};
  }
  const settings = await (prisma as any).globalSetting.findMany();
  return settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>);
}

export async function updatePlatformSetting(key: string, value: any) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const setting = await prisma.globalSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });

  // Log to Audit Trail
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: `CONFIG_UPDATE_${key.toUpperCase()}`,
      payload: { key, newValue: value }
    }
  });

  revalidatePath('/admin/settings');
  return setting;
}

export async function getSystemHealth() {
  // Simulate system health monitoring
  return {
    database: 'healthy',
    api: 'operational',
    storage: '92% free',
    lastSync: new Date().toISOString()
  };
}
