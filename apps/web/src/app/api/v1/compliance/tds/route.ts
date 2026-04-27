import { NextResponse } from 'next/server';
import { TDSEngine } from '@/services/tds-engine';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter'); // Format: Q1-2026

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId in session' }, { status: 400 });
    }

    if (!quarter) {
      return NextResponse.json({ error: 'Missing quarter parameter (e.g., Q1-2026)' }, { status: 400 });
    }

    const report = await TDSEngine.generateForm26Q(tenantId, companyId, quarter);
    
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error generating TDS Form 26Q:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate TDS Form 26Q' }, { status: 500 });
  }
}
