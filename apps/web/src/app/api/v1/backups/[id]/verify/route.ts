import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { verifyBackupIntegrity } from '@/lib/backup-service';

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

    const verification = await verifyBackupIntegrity(id, session.user.tenantId);

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error('[Backup Integrity Verify POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
