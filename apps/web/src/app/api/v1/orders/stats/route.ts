import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session.user;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const baseWhere: any = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      baseWhere.OR = [
        { lrNo: { contains: search, mode: 'insensitive' } },
        { dealer: { name: { contains: search, mode: 'insensitive' } } },
        { consignee: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { regNo: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      baseWhere.date = {};
      if (startDate) baseWhere.date.gte = new Date(startDate);
      if (endDate) baseWhere.date.lte = new Date(endDate);
    }

    const [todayCount, inTransitCount, deliveredCount, monthlyRevenue] = await Promise.all([
      // Today's LRs (Always today)
      prisma.order.count({
        where: {
          companyId,
          date: { gte: todayStart, lte: todayEnd },
          deletedAt: null,
        },
      }),
      // In Transit (Filtered)
      prisma.order.count({
        where: {
          ...baseWhere,
          status: { in: ['loaded', 'in_transit'] },
        },
      }),
      // Delivered (Filtered)
      prisma.order.count({
        where: {
          ...baseWhere,
          status: 'delivered',
        },
      }),
      // Revenue (Filtered)
      prisma.order.aggregate({
        where: {
          ...baseWhere,
          status: { not: 'cancelled' },
        },
        _sum: { totalAmount: true },
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
