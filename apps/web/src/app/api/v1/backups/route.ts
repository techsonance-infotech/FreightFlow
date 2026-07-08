import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { createBackup } from '@/lib/backup-service';
import { validateBackupAuthToken } from '@/lib/backup-otp';

// ─── GET /api/v1/backups — List backups ─────────────────────
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    };

    if (type) where.type = type;
    if (status) where.status = status;

    const [backups, total] = await Promise.all([
      prisma.backupJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.backupJob.count({ where }),
    ]);

    // Serialize BigInt fields
    const serialized = backups.map((b) => ({
      ...b,
      fileSize: b.fileSize?.toString() || null,
      originalSize: b.originalSize?.toString() || null,
    }));

    return NextResponse.json({
      data: serialized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('[Backups GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST /api/v1/backups — Create backup ───────────────────
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
    const { authToken, name, includes } = body;

    // Validate OTP auth token
    const auth = await validateBackupAuthToken(authToken, 'BACKUP_CREATE');
    if (!auth || auth.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Invalid or expired authorization. Please verify OTP again.' }, { status: 403 });
    }

    const jobId = await createBackup({
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      userId: session.user.id,
      type: 'manual',
      name,
      includes,
    });

    return NextResponse.json({ success: true, jobId }, { status: 201 });
  } catch (error: any) {
    console.error('[Backups POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
