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
      return NextResponse.json({ error: 'Missing tenantId or companyId in session' }, { status: 400 });
    }

    if (!period) {
      return NextResponse.json({ error: 'Missing period parameter (YYYY-MM)' }, { status: 400 });
    }

    const report = await GSTEngine.generateGSTR1(tenantId, companyId, period);
    
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error generating GSTR-1:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate GSTR-1' }, { status: 500 });
  }
}
