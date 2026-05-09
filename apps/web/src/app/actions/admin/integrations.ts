'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';
import { randomBytes } from 'crypto';

export async function getTenantApiKeys(tenantId: string) {
  return await prisma.platformApiKey.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createApiKey(tenantId: string, name: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const key = `ff_live_${randomBytes(24).toString('hex')}`;

  const apiKey = await prisma.platformApiKey.create({
    data: {
      tenantId,
      name,
      key,
      status: 'active'
    }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: 'API_KEY_CREATED',
      targetTenantId: tenantId,
      payload: { apiKeyId: apiKey.id, name }
    }
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  return apiKey;
}

export async function revokeApiKey(apiKeyId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const apiKey = await prisma.platformApiKey.update({
    where: { id: apiKeyId },
    data: { status: 'revoked' }
  });

  revalidatePath(`/admin/tenants/${apiKey.tenantId}`);
  return apiKey;
}

export async function getTenantWebhooks(tenantId: string) {
  return await prisma.webhookConfig.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createWebhook(tenantId: string, url: string, events: string[]) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const secret = randomBytes(16).toString('hex');

  const webhook = await prisma.webhookConfig.create({
    data: {
      tenantId,
      url,
      events,
      secret,
      status: 'active'
    }
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  return webhook;
}
