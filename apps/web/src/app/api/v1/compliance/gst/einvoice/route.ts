import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const dealerId = searchParams.get('dealerId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // Pallet or Box

    // Build Where Clause
    const where: any = {
      tenantId,
      companyId,
    };

    if (dealerId) {
      where.customerId = dealerId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) {
      where.orders = {
        some: {
          details: {
            some: {
              packingType: { contains: type, mode: 'insensitive' }
            }
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const invoices = await prisma.freightInvoice.findMany({
      where,
      include: {
        eInvoiceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    });

    // Since we don't have a direct relation in schema, we fetch customers separately
    const customerIds = Array.from(new Set(invoices.map(i => i.customerId)));
    const customers = await prisma.dealer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, gstin: true }
    });

    const customerMap = new Map(customers.map(c => [c.id, c]));

    const enrichedInvoices = invoices.map(inv => {
      const customer = customerMap.get(inv.customerId);
      const latestLog = inv.eInvoiceLogs[0];
      
      return {
        ...inv,
        customerName: customer?.name || 'Unknown',
        customerGstin: customer?.gstin || 'N/A',
        irnStatus: latestLog?.status || 'pending',
        irn: latestLog?.irn || null,
        ackNo: latestLog?.ackNo || null,
        ackDate: latestLog?.ackDate || null,
      };
    });

    const total = await prisma.freightInvoice.count({ where });

    return NextResponse.json({
      data: enrichedInvoices,
      meta: { total, page, limit }
    });
  } catch (error: any) {
    console.error('Error fetching e-invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch e-invoices' }, { status: 500 });
  }
}
