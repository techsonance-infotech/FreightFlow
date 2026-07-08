import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'backup'; // backup, restore

    if (type === 'restore') {
      const job = await prisma.backupRestoreJob.findFirst({
        where: {
          id,
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
        },
      });

      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      return NextResponse.json({ success: true, job });
    } else {
      const job = await prisma.backupJob.findFirst({
        where: {
          id,
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
        },
      });

      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      return NextResponse.json({
        success: true,
        job: {
          ...job,
          fileSize: job.fileSize?.toString() || null,
          originalSize: job.originalSize?.toString() || null,
        },
      });
    }
  } catch (error: any) {
    console.error('[Backup Job Detail GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
