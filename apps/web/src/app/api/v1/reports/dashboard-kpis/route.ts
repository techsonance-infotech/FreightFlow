import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const [kpis, trend] = await Promise.all([
      ReportEngine.getDashboardKPIs(tenantId, companyId),
      ReportEngine.getRevenueTrend(tenantId, companyId),
    ]);

    return NextResponse.json({ kpis, trend });
  } catch (error: any) {
    console.error('[Dashboard Report Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
