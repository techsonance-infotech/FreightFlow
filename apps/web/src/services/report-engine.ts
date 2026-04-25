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
   * Dashboard KPIs with trends and fleet alerts.
   */
  static async getDashboardKPIs(tenantId: string, companyId: string) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    // 1. Today's LRs vs Yesterday
    const [todayLrs, yesterdayLrs] = await Promise.all([
      prisma.order.count({ where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } } }),
      prisma.order.count({ where: { companyId, createdAt: { gte: startOfYesterday, lte: endOfYesterday } } }),
    ]);

    // 2. Today's Revenue vs Yesterday
    const [todayRev, yesterdayRev] = await Promise.all([
      prisma.order.aggregate({ where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { companyId, createdAt: { gte: startOfYesterday, lte: endOfYesterday } }, _sum: { totalAmount: true } }),
    ]);

    // 3. Outstanding Receivables
    const outstanding = await prisma.freightInvoice.aggregate({
      where: { companyId, status: { notIn: ['paid', 'cancelled'] } },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    // 4. Fleet Stats
    const [totalVehicles, onTripVehicles, maintenanceVehicles] = await Promise.all([
      prisma.vehicle.count({ where: { companyId } }),
      prisma.trip.count({ where: { companyId, status: 'on_transit' } }), // Should use in_transit based on phase 4
      prisma.maintenanceJob.count({ where: { companyId, status: 'in_progress' } })
    ]);

    // 5. Documents Expiring (within 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const expiringDocsCount = await prisma.vehicleDocument.count({
      where: { companyId, expiryDate: { lte: thirtyDaysLater, gte: new Date() } }
    });

    // 6. Top 5 Customers by Revenue
    const topCustomers = await prisma.order.groupBy({
      by: ['dealerId'],
      where: { companyId },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5
    });

    const dealerIds = topCustomers.map(c => c.dealerId).filter(Boolean) as string[];
    const dealers = await prisma.dealer.findMany({
      where: { id: { in: dealerIds } },
      select: { id: true, name: true }
    });

    const customersWithNames = topCustomers.map(c => ({
      name: dealers.find(d => d.id === c.dealerId)?.name || 'Unknown',
      revenue: (c._sum.totalAmount || 0) / 100
    }));

    return {
      todayLrs,
      lrsTrend: yesterdayLrs > 0 ? ((todayLrs - yesterdayLrs) / yesterdayLrs) * 100 : 0,
      todayRevenue: todayRev._sum.totalAmount || 0,
      revenueTrend: (yesterdayRev._sum.totalAmount || 0) > 0 ? (((todayRev._sum.totalAmount || 0) - (yesterdayRev._sum.totalAmount || 0)) / (yesterdayRev._sum.totalAmount || 0)) * 100 : 0,
      outstandingReceivables: outstanding._sum.totalAmount || 0,
      overdueCount: outstanding._count.id,
      expiringDocsCount,
      topCustomers: customersWithNames,
      fleetUtilization: {
        total: totalVehicles,
        onTrip: onTripVehicles,
        maintenance: maintenanceVehicles,
        idle: Math.max(0, totalVehicles - onTripVehicles - maintenanceVehicles)
      }
    };
  }

  /**
   * Generates a Balance Sheet.
   */
  static async getBalanceSheet(tenantId: string, companyId: string, asOnDate: Date = new Date()) {
    const trialBalance = await this.getTrialBalance(tenantId, companyId, undefined, asOnDate);
    
    const assets = trialBalance.filter(a => a.accountType === 'asset');
    const liabilities = trialBalance.filter(a => a.accountType === 'liability');
    const equity = trialBalance.filter(a => a.accountType === 'equity');

    // Net Profit/Loss from start of time till asOnDate
    const pl = await this.getProfitLoss(tenantId, companyId, new Date('2000-01-01'), asOnDate);

    return {
      asOnDate,
      assets: {
        items: assets,
        total: assets.reduce((acc, curr) => acc + curr.balance, 0)
      },
      liabilities: {
        items: liabilities,
        total: liabilities.reduce((acc, curr) => acc + Math.abs(curr.balance), 0)
      },
      equity: {
        items: equity,
        total: equity.reduce((acc, curr) => acc + Math.abs(curr.balance), 0),
        netProfit: pl.netProfit
      },
      totalLiabilitiesAndEquity: liabilities.reduce((acc, curr) => acc + Math.abs(curr.balance), 0) + 
                                equity.reduce((acc, curr) => acc + Math.abs(curr.balance), 0) + 
                                pl.netProfit
    };
  }

  /**
   * Debtors/Creditors Ageing Report
   */
  static async getAgeingReport(tenantId: string, companyId: string, type: 'debtors' | 'creditors' = 'debtors') {
    const today = new Date();
    
    // For debtors, we look at FreightInvoices
    const invoices = await prisma.freightInvoice.findMany({
      where: { 
        companyId, 
        status: { notIn: ['paid', 'cancelled'] } 
      },
      include: {
        orders: {
          select: { dealer: { select: { name: true } } }
        }
      }
    });

    const report: Record<string, { name: string; total: number; buckets: Record<string, number> }> = {};

    invoices.forEach(inv => {
      const dealerName = inv.orders[0]?.dealer?.name || 'Unknown';
      if (!report[inv.customerId]) {
        report[inv.customerId] = { 
          name: dealerName, 
          total: 0, 
          buckets: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 } 
        };
      }

      const daysOverdue = differenceInDays(today, inv.date);
      const amount = inv.totalAmount;
      report[inv.customerId].total += amount;

      if (daysOverdue <= 30) report[inv.customerId].buckets['0-30'] += amount;
      else if (daysOverdue <= 60) report[inv.customerId].buckets['31-60'] += amount;
      else if (daysOverdue <= 90) report[inv.customerId].buckets['61-90'] += amount;
      else report[inv.customerId].buckets['90+'] += amount;
    });

    return Object.values(report);
  }

  /**
   * LR Register (Detailed operational report)
   */
  static async getLRRegister(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    return prisma.order.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        dealer: { select: { name: true } },
        consignee: { select: { name: true } },
        vehicle: { select: { regNo: true } },
        podRecord: true
      },
      orderBy: { date: 'desc' }
    });
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
      const revenue = await prisma.order.aggregate({
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
        where: { vehicleId: v.id, date: { gte: startDate, lte: endDate } },
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
      where: { companyId, date: { gte: startDate, lte: endDate } },
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

function differenceInDays(date1: Date, date2: Date) {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
