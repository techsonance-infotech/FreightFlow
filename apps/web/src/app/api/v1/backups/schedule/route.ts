import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { validateBackupAuthToken } from '@/lib/backup-otp';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schedule = await prisma.backupSchedule.findUnique({
      where: {
        tenantId_companyId: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
        },
      },
    });

    return NextResponse.json(schedule || { enabled: false });
  } catch (error: any) {
    console.error('[Backup Schedule GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { authToken, enabled, frequency, cron, timezone, retentionDays, backupType } = body;

    const auth = await validateBackupAuthToken(authToken, 'BACKUP_SCHEDULE_CHANGE');
    if (!auth || auth.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Invalid or expired authorization. Please verify OTP again.' }, { status: 403 });
    }

    // Upsert backup schedule
    const schedule = await prisma.backupSchedule.upsert({
      where: {
        tenantId_companyId: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
        },
      },
      update: {
        enabled,
        frequency,
        cron,
        timezone,
        retentionDays,
        backupType,
        updatedBy: session.user.id,
      },
      create: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        enabled,
        frequency,
        cron,
        timezone,
        retentionDays,
        backupType,
        updatedBy: session.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        userId: session.user.id,
        action: 'settings.updated',
        entityType: 'BackupSchedule',
        entityId: schedule.id,
        changes: { schedule },
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error('[Backup Schedule POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
