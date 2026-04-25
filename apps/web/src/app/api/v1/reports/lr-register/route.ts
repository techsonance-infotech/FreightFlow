import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : startOfMonth(new Date());
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : endOfMonth(new Date());

    const data = await ReportEngine.getLRRegister(
      session.user.tenantId,
      session.user.companyId!,
      startDate,
      endDate
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
