import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { BankReconService } from '@/services/bank-recon';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    const body = await request.json();
    const { accountId, statementRows } = body;

    if (!accountId || !statementRows || !Array.isArray(statementRows)) {
      return NextResponse.json({ error: 'Invalid payload. accountId and statementRows are required.' }, { status: 400 });
    }

    const report = await BankReconService.processStatement(tenantId, companyId, accountId, statementRows);
    
    return NextResponse.json({ data: report }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing bank reconciliation:', error);
    return NextResponse.json({ error: error.message || 'Failed to process bank reconciliation' }, { status: 500 });
  }
}
