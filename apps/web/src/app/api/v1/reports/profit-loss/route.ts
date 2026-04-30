import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'standard';
    const startDate = parseISO(searchParams.get('startDate') || startOfMonth(new Date()).toISOString());
    const endDate = parseISO(searchParams.get('endDate') || endOfMonth(new Date()).toISOString());

    let report;
    if (type === 'standard') {
      report = await ReportEngine.getProfitLoss(tenantId, companyId, startDate, endDate);
    } else if (type === 'dealer') {
      report = await ReportEngine.getDealerPnL(tenantId, companyId, startDate, endDate);
    } else if (type === 'category') {
      report = await ReportEngine.getCategoryPnL(tenantId, companyId, startDate, endDate);
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[P&L Report Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
