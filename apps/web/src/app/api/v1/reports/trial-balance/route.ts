import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';
import { parseISO } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);
    
    const startStr = searchParams.get('startDate');
    const endStr = searchParams.get('endDate');

    const startDate = startStr ? parseISO(startStr) : undefined;
    const endDate = endStr ? parseISO(endStr) : undefined;

    const report = await ReportEngine.getTrialBalance(tenantId, companyId, startDate, endDate);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[Trial Balance Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
