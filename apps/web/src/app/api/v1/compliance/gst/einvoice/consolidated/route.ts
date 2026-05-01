import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // Pallet or Box

    if (!dealerId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing dealerId, startDate, or endDate' }, { status: 400 });
    }

    // 1. Fetch Dealer info
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { name: true, gstin: true }
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Build Where Clause
    const where: any = {
      tenantId,
      companyId,
      dealerId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (type) {
      where.details = {
        some: {
          packingType: { contains: type, mode: 'insensitive' }
        }
      };
    }

    // 2. Fetch Orders for the period
    const orders = await prisma.order.findMany({
      where,
      include: {
        details: true
      },
      orderBy: { date: 'asc' }
    });

    // 3. Aggregate Data
    let totalPallets = 0;
    let totalBoxes = 0;
    let totalAmount = 0;

    const items = orders.map(order => {
      const palletCount = order.details.filter(d => d.packingType?.toLowerCase().includes('pallet')).reduce((acc, d) => acc + d.boxCount, 0);
      const boxCount = order.details.filter(d => !d.packingType?.toLowerCase().includes('pallet')).reduce((acc, d) => acc + d.boxCount, 0);
      
      // If filtering by type, ensure we only include relevant items
      if (type === 'Pallet' && palletCount === 0) return null;
      if (type === 'Box' && boxCount === 0 && palletCount > 0) return null; // Simplified logic

      const orderAmount = order.totalAmount || 0;
      totalAmount += orderAmount;
      totalPallets += palletCount;
      totalBoxes += boxCount;

      return {
        date: order.date,
        orderNo: order.lrNo,
        type: palletCount > 0 ? 'Pallet' : 'Box',
        qty: palletCount > 0 ? palletCount : boxCount,
        amount: orderAmount,
        podVerified: order.status === 'delivered',
      };
    }).filter(Boolean);

    const totalTax = Math.round(totalAmount * 0.05); // Assume 5% GST for demo, should be dynamic
    const finalAmount = totalAmount + totalTax;

    return NextResponse.json({
      data: {
        dealerName: dealer.name,
        period: `${startDate} to ${endDate}`,
        masterInvoiceNo: `CON-INV-${format(new Date(), 'yyyyMM')}-${dealerId.substring(0, 4).toUpperCase()}`,
        status: 'draft',
        summary: {
          totalPallets,
          totalBoxes,
          totalDispatch: orders.length,
          totalTaxableValue: totalAmount,
          totalTax,
          totalAmount: finalAmount,
          missingPODs: orders.filter(o => o.status !== 'delivered').length
        },
        items
      }
    });
  } catch (error: any) {
    console.error('Error fetching consolidated data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch consolidated data' }, { status: 500 });
  }
}
