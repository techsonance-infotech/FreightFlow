import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfDay, startOfMonth, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    const [todayCount, monthlyCount, allDetails] = await Promise.all([
      // Today's records
      prisma.orderPallet.count({
        where: {
          tenantId: user.tenantId,
          companyId: user.companyId,
          createdAt: { gte: todayStart, lte: todayEnd },
          deletedAt: null,
        }
      }),
      // Monthly records
      prisma.orderPallet.count({
        where: {
          tenantId: user.tenantId,
          companyId: user.companyId,
          createdAt: { gte: monthStart },
          deletedAt: null,
        }
      }),
      // Total Weight & Boxes (all active)
      prisma.palletDetail.findMany({
        where: {
          companyId: user.companyId,
          pallet: {
            tenantId: user.tenantId,
            deletedAt: null,
          }
        },
        select: {
          weight: true,
          boxQty: true,
        }
      })
    ]);

    const totals = allDetails.reduce((acc, curr) => ({
      weight: acc.weight + Number(curr.weight || 0),
      boxes: acc.boxes + (curr.boxQty || 0),
    }), { weight: 0, boxes: 0 });

    return NextResponse.json({
      todayCount,
      monthlyCount,
      totalWeight: totals.weight,
      totalBoxes: totals.boxes
    });
  } catch (error) {
    console.error('[PALLETS_STATS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
