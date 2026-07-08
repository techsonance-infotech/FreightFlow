import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { restoreBackup } from '@/lib/backup-service';
import { validateBackupAuthToken } from '@/lib/backup-otp';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { authToken, restoreType = 'full' } = body;

    const auth = await validateBackupAuthToken(authToken, 'BACKUP_RESTORE');
    if (!auth || auth.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Invalid or expired authorization. Please verify OTP again.' }, { status: 403 });
    }

    const restoreJobId = await restoreBackup({
      backupId: id,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      userId: session.user.id,
      restoreType,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        userId: session.user.id,
        action: 'backup_restored',
        entityType: 'BackupJob',
        entityId: id,
        changes: { restoreJobId, restoreType, requestedAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true, restoreJobId });
  } catch (error: any) {
    console.error('[Backup Restore POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
