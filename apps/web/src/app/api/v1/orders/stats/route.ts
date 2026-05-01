import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session.user;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [todayCount, inTransitCount, deliveredCount, monthlyRevenue] = await Promise.all([
      // Today's LRs
      prisma.order.count({
        where: {
          companyId,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
          deletedAt: null,
        },
      }),
      // In Transit
      prisma.order.count({
        where: {
          companyId,
          status: {
            in: ['loaded', 'in_transit'],
          },
          deletedAt: null,
        },
      }),
      // Delivered (last 30 days or overall?) - let's do overall for now or monthly
      prisma.order.count({
        where: {
          companyId,
          status: 'delivered',
          deletedAt: null,
        },
      }),
      // Monthly Revenue
      prisma.order.aggregate({
        where: {
          companyId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: {
            not: 'cancelled',
          },
          deletedAt: null,
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return NextResponse.json({
      todayCount,
      inTransitCount,
      deliveredCount,
      monthlyRevenue: (monthlyRevenue._sum.totalAmount || 0) / 100, // Convert paise to INR
    });
  } catch (error) {
    console.error('[ORDER_STATS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
