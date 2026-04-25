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
    const startStr = searchParams.get('startDate');
    const endStr = searchParams.get('endDate');

    const startDate = startStr ? parseISO(startStr) : startOfMonth(new Date());
    const endDate = endStr ? parseISO(endStr) : endOfMonth(new Date());

    const report = await ReportEngine.getProfitLoss(tenantId, companyId, startDate, endDate);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[P&L Report Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
