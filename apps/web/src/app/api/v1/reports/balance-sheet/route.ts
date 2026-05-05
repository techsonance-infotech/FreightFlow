import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();

    const data = await ReportEngine.getBalanceSheet(
      session.user.tenantId,
      session.user.companyId!,
      date
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
