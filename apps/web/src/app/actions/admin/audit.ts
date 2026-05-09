'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';

export async function getPlatformLogs(page = 1, limit = 50, filters: any = {}) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
  if (filters.tenantId) where.targetTenantId = filters.tenantId;

  const [logs, total] = await Promise.all([
    prisma.auditLogPlatform.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { email: true } } }
    }),
    prisma.auditLogPlatform.count({ where })
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}

export async function getTenantLogs(page = 1, limit = 50, filters: any = {}) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.action) where.action = filters.action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { 
        tenant: { select: { name: true } },
        company: { select: { name: true } },
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}

export async function getAuditStats() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [platformCount, tenantCount, topAdmins] = await Promise.all([
    prisma.auditLogPlatform.count({ where: { createdAt: { gte: last24h } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: last24h } } }),
    prisma.auditLogPlatform.groupBy({
      by: ['adminId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })
  ]);

  return {
    dailyTotal: platformCount + tenantCount,
    platformCount,
    tenantCount,
    topAdmins
  };
}
