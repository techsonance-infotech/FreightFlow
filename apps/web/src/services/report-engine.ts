import { prisma } from '@freightflow/db';
import { format } from 'date-fns';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export class ReportEngine {
  /**
   * Generates a Trial Balance report aggregating all ledger lines.
   */
  static async getTrialBalance(tenantId: string, companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      journalEntry: {
        tenantId,
        companyId,
      },
    };

    if (startDate && endDate) {
      where.journalEntry.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const lines = await prisma.journalLine.groupBy({
      by: ['accountId'],
      where,
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, companyId },
      select: { id: true, name: true, code: true, type: true },
    });

    const report = accounts.map(acc => {
      const summary = lines.find(l => l.accountId === acc.id);
      return {
        accountId: acc.id,
        accountName: acc.name,
        accountCode: acc.code,
        accountType: acc.type,
        debit: summary?._sum.debit || 0,
        credit: summary?._sum.credit || 0,
        balance: (summary?._sum.debit || 0) - (summary?._sum.credit || 0),
      };
    });

    return report;
  }

  /**
   * Generates a Profit & Loss statement.
   */
  static async getProfitLoss(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const trialBalance = await this.getTrialBalance(tenantId, companyId, startDate, endDate);
    
    const revenue = trialBalance
      .filter(a => a.accountType === 'revenue')
      .reduce((acc, curr) => acc + Math.abs(curr.balance), 0); // Revenue is usually credit balance
    
    const expenses = trialBalance
      .filter(a => a.accountType === 'expense')
      .reduce((acc, curr) => acc + curr.balance, 0);

    return {
      startDate,
      endDate,
      revenue,
      expenses,
      netProfit: revenue - expenses,
      details: trialBalance.filter(a => ['revenue', 'expense'].includes(a.accountType)),
    };
  }

  /**
   * Dashboard KPIs
   */
  static async getDashboardKPIs(tenantId: string, companyId: string) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Today's LRs
    const todayLrs = await prisma.order.count({
      where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } }
    });

    // 2. Today's Revenue
    const todayRevenue = await prisma.order.aggregate({
      where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { totalAmount: true }
    });

    // 3. Outstanding Receivables (All time unpaid invoices)
    const outstanding = await prisma.freightInvoice.aggregate({
      where: { companyId, status: { notIn: ['paid', 'cancelled'] } },
      _sum: { totalAmount: true }
    });

    // 4. Vehicle Stats
    const totalVehicles = await prisma.vehicle.count({ where: { companyId } });
    const onTripVehicles = await prisma.trip.count({ 
      where: { companyId, status: 'on_trip' } 
    });

    return {
      todayLrs,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      outstandingReceivables: outstanding._sum.totalAmount || 0,
      fleetUtilization: {
        total: totalVehicles,
        onTrip: onTripVehicles,
        idle: totalVehicles - onTripVehicles
      }
    };
  }

  /**
   * Revenue Trend (Last 6 Months)
   */
  static async getRevenueTrend(tenantId: string, companyId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, 'MMM yy')
      });
    }

    const trend = await Promise.all(months.map(async (m) => {
      const revenue = await prisma.freightInvoice.aggregate({
        where: { 
          companyId, 
          date: { gte: m.start, lte: m.end },
          status: { not: 'cancelled' }
        },
        _sum: { totalAmount: true }
      });
      return {
        month: m.label,
        revenue: (revenue._sum.totalAmount || 0) / 100 // Convert to main currency
      };
    }));

    return trend;
  }

  /**
   * Vehicle-wise P&L (Freight vs Maintenance & Fuel)
   */
  static async getVehiclePnL(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId },
      select: { id: true, regNo: true, model: true }
    });

    const report = await Promise.all(vehicles.map(async (v) => {
      // 1. Freight Earned
      const revenue = await prisma.order.aggregate({
        where: { vehicleId: v.id, createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      });

      // 2. Fuel Expenses
      const fuel = await prisma.fuelEntry.aggregate({
        where: { vehicleId: v.id, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      });

      // 3. Maintenance Expenses
      const maintenance = await prisma.maintenanceJob.aggregate({
        where: { vehicleId: v.id, completedAt: { gte: startDate, lte: endDate } },
        _sum: { actualCost: true }
      });

      const rev = revenue._sum.totalAmount || 0;
      const exp = (fuel._sum.amount || 0) + (maintenance._sum.actualCost || 0);

      return {
        vehicleId: v.id,
        regNo: v.regNo,
        model: v.model,
        revenue: rev,
        expenses: exp,
        netProfit: rev - exp,
        margin: rev > 0 ? ((rev - exp) / rev) * 100 : 0
      };
    }));

    return report;
  }

  /**
   * Route-wise Profitability
   */
  static async getRouteProfitability(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: { companyId, createdAt: { gte: startDate, lte: endDate } },
      select: {
        fromLocation: true,
        toLocation: true,
        totalAmount: true,
      }
    });

    const routes: Record<string, { revenue: number; orderCount: number }> = {};
    
    orders.forEach(o => {
      const key = `${o.fromLocation} to ${o.toLocation}`;
      if (!routes[key]) routes[key] = { revenue: 0, orderCount: 0 };
      routes[key].revenue += o.totalAmount;
      routes[key].orderCount += 1;
    });

    return Object.entries(routes).map(([route, stats]) => ({
      route,
      ...stats,
      avgRevenue: stats.revenue / stats.orderCount
    })).sort((a, b) => b.revenue - a.revenue);
  }
}
