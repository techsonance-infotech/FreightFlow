import { NextResponse } from 'next/server';
import { AccountingEngine } from '@/services/accounting-engine';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'AR' | 'AP' || 'AR';
    const search = searchParams.get('search') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const report = await AccountingEngine.getAgeingReport(tenantId, companyId, type, { 
      search, 
      customerId, 
      startDate, 
      endDate, 
      page, 
      limit 
    });
    
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error fetching Ageing Report:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Ageing Report' }, { status: 500 });
  }
}
