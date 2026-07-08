import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'backup'; // backup, restore

    if (type === 'restore') {
      const restoreJobs = await prisma.backupRestoreJob.findMany({
        where: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          status: { in: ['queued', 'snapshot_creating', 'restoring', 'verifying', 'validating'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, jobs: restoreJobs });
    } else {
      const backupJobs = await prisma.backupJob.findMany({
        where: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          status: { in: ['queued', 'preparing', 'compressing', 'encrypting', 'uploading'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Serialize BigInt
      const serialized = backupJobs.map((b) => ({
        ...b,
        fileSize: b.fileSize?.toString() || null,
        originalSize: b.originalSize?.toString() || null,
      }));

      return NextResponse.json({ success: true, jobs: serialized });
    }
  } catch (error: any) {
    console.error('[Backup Jobs GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
