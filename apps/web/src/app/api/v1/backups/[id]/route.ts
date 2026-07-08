import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { deleteBackup } from '@/lib/backup-service';
import { validateBackupAuthToken } from '@/lib/backup-otp';

export async function GET(
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

    const backup = await prisma.backupJob.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...backup,
      fileSize: backup.fileSize?.toString() || null,
      originalSize: backup.originalSize?.toString() || null,
    });
  } catch (error: any) {
    console.error('[Backup Detail GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const { authToken } = body;

    const auth = await validateBackupAuthToken(authToken, 'BACKUP_DELETE');
    if (!auth || auth.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Invalid or expired authorization. Please verify OTP again.' }, { status: 403 });
    }

    await deleteBackup(id, session.user.tenantId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        userId: session.user.id,
        action: 'backup_deleted',
        entityType: 'BackupJob',
        entityId: id,
        changes: { deletedAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Backup DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
