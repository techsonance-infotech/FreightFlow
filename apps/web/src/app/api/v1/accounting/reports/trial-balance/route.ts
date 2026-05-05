import { NextResponse } from 'next/server';
import { AccountingEngine } from '@/services/accounting-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || request.headers.get('x-tenant-id');
    const companyId = searchParams.get('companyId') || request.headers.get('x-company-id');

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

    const report = await AccountingEngine.getTrialBalance(tenantId, companyId);
    
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error fetching Trial Balance:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Trial Balance' }, { status: 500 });
  }
}
