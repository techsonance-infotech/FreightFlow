import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfDay, startOfMonth, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    const whereBase: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (typeFilter) {
      whereBase.type = typeFilter;
    }

    if (startDate || endDate) {
      whereBase.date = {};
      if (startDate) whereBase.date.gte = new Date(startDate);
      if (endDate) whereBase.date.lte = new Date(endDate);
    }

    const [todayCount, monthlyCount, allDetails] = await Promise.all([
      // Filtered today's records
      prisma.orderPallet.count({
        where: {
          ...whereBase,
          createdAt: { gte: todayStart, lte: todayEnd },
        }
      }),
      // Filtered monthly records
      prisma.orderPallet.count({
        where: {
          ...whereBase,
          createdAt: { gte: monthStart },
        }
      }),
      // Filtered total Weight & Boxes
      prisma.palletDetail.findMany({
        where: {
          companyId: user.companyId,
          pallet: whereBase
        },
        select: {
          weight: true,
          boxQty: true,
          qty: true,
        }
      })
    ]);

    const totals = allDetails.reduce((acc, curr) => ({
      weight: acc.weight + Number(curr.weight || 0),
      boxes: acc.boxes + (curr.boxQty || 0) + (curr.qty || 0),
    }), { weight: 0, boxes: 0 });

    return NextResponse.json({
      todayCount,
      monthlyCount,
      totalWeight: totals.weight,
      totalBoxes: totals.boxes,
      allTimeCount: await prisma.orderPallet.count({ where: whereBase })
    });
  } catch (error) {
    console.error('[PALLETS_STATS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
