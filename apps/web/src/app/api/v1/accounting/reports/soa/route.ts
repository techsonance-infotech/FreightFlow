import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { AccountingEngine } from '@/services/accounting-engine';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const partyId = searchParams.get('partyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!partyId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const report = await AccountingEngine.getStatementOfAccount(
      session.user.tenantId,
      session.user.companyId,
      partyId,
      startDate,
      endDate
    );

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('[SOA Report Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
