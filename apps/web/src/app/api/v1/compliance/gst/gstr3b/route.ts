import { NextResponse } from 'next/server';
import { GSTEngine } from '@/services/gst-engine';
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
    const period = searchParams.get('period'); // Format: YYYY-MM

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing context' }, { status: 400 });
    }

    if (!period) {
      return NextResponse.json({ error: 'Missing period (YYYY-MM)' }, { status: 400 });
    }

    const report = await GSTEngine.generateGSTR3B(tenantId, companyId, period);
    
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('GSTR-3B API Error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
