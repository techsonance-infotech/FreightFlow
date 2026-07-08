import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { getBackupStats } from '@/lib/backup-service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.tenantId || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stats = await getBackupStats(session.user.tenantId, session.user.companyId);

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('[Backup Stats GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
