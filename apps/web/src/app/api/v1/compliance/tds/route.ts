import { NextResponse } from 'next/server';
import { TDSEngine } from '@/services/tds-engine';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const section = searchParams.get('section') || undefined;
    const deposited = searchParams.get('deposited') === 'true' ? true : searchParams.get('deposited') === 'false' ? false : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId in session' }, { status: 400 });
    }

    const report = await TDSEngine.getTDSRegister({
      tenantId,
      companyId,
      startDate,
      endDate,
      vendorId,
      section,
      deposited,
      page,
      limit
    });

    // Enrich with Dealer details (acting as Vendors for TDS)
    const dealerIds = Array.from(new Set(report.entries.map(e => e.vendorId)));
    const dealers = await prisma.dealer.findMany({
      where: { id: { in: dealerIds } },
      select: { id: true, name: true, pan: true }
    });

    const dealerMap = new Map(dealers.map(d => [d.id, d]));

    const enrichedEntries = report.entries.map(entry => {
      const dealer = dealerMap.get(entry.vendorId);
      return {
        ...entry,
        vendorName: dealer?.name || 'Unknown Entity',
        vendorPan: dealer?.pan || 'N/A'
      };
    });
    
    return NextResponse.json({ 
      data: {
        ...report.summary,
        entries: enrichedEntries,
        total: report.total,
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error generating TDS Form 26Q:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate TDS Form 26Q' }, { status: 500 });
  }
}
