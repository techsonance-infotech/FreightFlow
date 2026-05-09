'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { headers } from 'next/headers';

export type AuditAction = 
  | 'user.role_changed'
  | 'user.status_toggled'
  | 'user.permissions_updated'
  | 'user.credentials_resent'
  | 'user.created'
  | 'employee.created'
  | 'employee.updated'
  | 'employee.deleted'
  | 'company.updated'
  | 'branding.updated'
  | 'settings.updated';

interface AuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) return;

    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        userId: session.user.id,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: {
          ...input.changes,
          performedBy: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          },
          timestamp: new Date().toISOString(),
        },
        ipAddress: ip?.split(',')[0]?.trim() || null,
      },
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record:', error);
    // Never throw — audit failures should not block user actions
  }
}
