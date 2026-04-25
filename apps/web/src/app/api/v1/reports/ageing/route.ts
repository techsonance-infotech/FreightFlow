import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') as 'debtors' | 'creditors') || 'debtors';

    const data = await ReportEngine.getAgeingReport(
      session.user.tenantId,
      session.user.companyId!,
      type
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
