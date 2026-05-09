'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getRouteProfitability() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const companyId = session.user.companyId;

  // 1. Get all trips with orders and expenses
  const trips = await prisma.trip.findMany({
    where: { companyId, status: 'settled' },
    include: {
      orders: {
        select: { totalAmount: true }
      },
      expenses: {
        select: { amount: true }
      }
    }
  });

  // 2. Aggregate by route (from-to)
  // For now, let's assume route is derived from first order or trip metadata
  const routeStats: Record<string, any> = {};

  trips.forEach(trip => {
    // Basic route key (could be improved with actual route model)
    const routeKey = "Interstate Distribution"; // Placeholder or derive from trip
    
    if (!routeStats[routeKey]) {
      routeStats[routeKey] = {
        name: routeKey,
        tripCount: 0,
        revenue: 0,
        expenses: 0,
      };
    }

    const revenue = trip.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const expenses = (trip.expenses.reduce((sum, e) => sum + e.amount, 0)) + (trip.advanceAmount || 0);

    routeStats[routeKey].tripCount += 1;
    routeStats[routeKey].revenue += revenue;
    routeStats[routeKey].expenses += expenses;
  });

  return Object.values(routeStats).map(r => ({
    ...r,
    profit: r.revenue - r.expenses,
    margin: r.revenue > 0 ? ((r.revenue - r.expenses) / r.revenue) * 100 : 0
  }));
}
