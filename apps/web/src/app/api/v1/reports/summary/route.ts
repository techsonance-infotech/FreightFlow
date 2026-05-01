import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const summary = await ReportEngine.getReportSummary(tenantId, companyId);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('[Report Summary Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
