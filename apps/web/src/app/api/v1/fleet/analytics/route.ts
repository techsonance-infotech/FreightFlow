import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        deletedAt: null
      },
      select: {
        id: true,
        regNo: true,
        type: true,
      }
    });

    const analytics = await Promise.all(vehicles.map(async (vehicle) => {
      // 1. Revenue (from Orders)
      const orders = await prisma.order.aggregate({
        where: { vehicleId: vehicle.id, status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
        _count: { id: true }
      });
      const revenue = (orders._sum.totalAmount || 0) / 100;
      const tripCount = orders._count.id;

      // 2. Fuel Cost
      const fuel = await prisma.fuelEntry.aggregate({
        where: { vehicleId: vehicle.id },
        _sum: { amount: true, quantity: true }
      });
      const fuelCost = (fuel._sum.amount || 0) / 100;
      const fuelVolume = Number(fuel._sum.quantity || 0);

      // 3. Maintenance Cost
      const maintenance = await prisma.maintenanceJob.aggregate({
        where: { vehicleId: vehicle.id },
        _sum: { actualCost: true }
      });
      const maintenanceCost = (maintenance._sum.actualCost || 0) / 100;

      // Profit Calculation
      const totalCost = fuelCost + maintenanceCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        vehicleId: vehicle.id,
        regNo: vehicle.regNo,
        type: vehicle.type,
        trips: tripCount,
        revenue,
        fuelCost,
        fuelVolume,
        maintenanceCost,
        totalCost,
        profit,
        margin: Number(margin.toFixed(2))
      };
    }));

    // Sort by profit descending
    analytics.sort((a, b) => b.profit - a.profit);

    // Global Summary
    const summary = analytics.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      fuelCost: acc.fuelCost + curr.fuelCost,
      maintenanceCost: acc.maintenanceCost + curr.maintenanceCost,
      profit: acc.profit + curr.profit,
    }), { revenue: 0, fuelCost: 0, maintenanceCost: 0, profit: 0 });

    return NextResponse.json({ data: analytics, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
