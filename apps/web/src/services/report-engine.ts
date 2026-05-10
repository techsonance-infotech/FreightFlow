import { prisma } from '@freightflow/db';
import { format } from 'date-fns';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';
import { unstable_cache } from 'next/cache';

export class ReportEngine {
  /**
   * Generates a Trial Balance report aggregating all ledger lines.
   */
  static async getTrialBalance(tenantId: string, companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      journalEntry: {
        tenantId,
        companyId,
        status: 'posted',
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
   * Dealer-wise Gross Profitability
   */
  static async getDealerPnL(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' }
      },
      include: {
        dealer: { select: { name: true } }
      }
    });

    const report: Record<string, any> = {};

    orders.forEach(o => {
      const dealerId = o.dealerId || 'direct';
      const dealerName = o.dealer?.name || 'Direct / Walk-in';

      if (!report[dealerId]) {
        report[dealerId] = {
          id: dealerId,
          name: dealerName,
          revenue: 0,
          trips: 0,
          grossProfit: 0 // In this context, we use totalAmount as revenue
        };
      }

      report[dealerId].revenue += o.totalAmount;
      report[dealerId].trips += 1;
      report[dealerId].grossProfit += o.totalAmount; // Simplified: Revenue = Gross Profit for now
    });

    return Object.values(report).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Category-wise P&L breakdown
   */
  static async getCategoryPnL(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const categories = await prisma.order.groupBy({
      by: ['rateOn'],
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    return categories.map(c => ({
      category: c.rateOn === 'weight' ? 'FTL / Weight Based' : 
                c.rateOn === 'box' ? 'PTL / Box Based' : 'Fixed / Trip Based',
      revenue: c._sum.totalAmount || 0,
      count: c._count.id,
      contribution: 100 // Placeholder for % contribution
    }));
  }

  /**
   * Dashboard KPIs with trends and fleet alerts.
   */
  static async getDashboardKPIs(tenantId: string, companyId: string) {
    return unstable_cache(
      async (tId: string, cId: string) => {
        return this._getDashboardKPIsInternal(tId, cId);
      },
      [`dashboard-kpis-${tenantId}-${companyId}`],
      { revalidate: 600, tags: [`dashboard-kpis-${tenantId}`] } // 10 minutes
    )(tenantId, companyId);
  }

  private static async _getDashboardKPIsInternal(tenantId: string, companyId: string) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    // Parallelize ALL independent queries into a single execution block
    const [
      todayLrs, yesterdayLrs, 
      todayRev, yesterdayRev, 
      outstanding, 
      totalVehicles, onTripVehicles, maintenanceVehicles,
      expiringDocsCount,
      topCustomersData
    ] = await Promise.all([
      prisma.order.count({ where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } } }),
      prisma.order.count({ where: { companyId, createdAt: { gte: startOfYesterday, lte: endOfYesterday } } }),
      prisma.order.aggregate({ where: { companyId, createdAt: { gte: startOfToday, lte: endOfToday } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { companyId, createdAt: { gte: startOfYesterday, lte: endOfYesterday } }, _sum: { totalAmount: true } }),
      prisma.freightInvoice.aggregate({
        where: { companyId, status: { notIn: ['paid', 'cancelled'] } },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.vehicle.count({ where: { companyId } }),
      prisma.trip.count({ where: { companyId, status: 'in_transit' } }),
      prisma.maintenanceJob.count({ where: { companyId, status: 'in_progress' } }),
      prisma.vehicleDocument.count({
        where: { companyId, expiryDate: { lte: thirtyDaysLater, gte: new Date() } }
      }),
      prisma.order.groupBy({
        by: ['dealerId'],
        where: { companyId },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5
      })
    ]);

    const dealerIds = topCustomersData.map(c => c.dealerId).filter(Boolean) as string[];
    const dealers = await prisma.dealer.findMany({
      where: { id: { in: dealerIds } },
      select: { id: true, name: true }
    });

    const customersWithNames = topCustomersData.map(c => ({
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
    return unstable_cache(
      async (tId: string, cId: string) => {
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
              companyId: cId, 
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
      },
      [`revenue-trend-${tenantId}-${companyId}`],
      { revalidate: 1800, tags: [`revenue-trend-${tenantId}`] } // 30 minutes
    )(tenantId, companyId);
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

  /**
   * Dealer/Customer Yield Analysis
   */
  static async getDealerAnalytics(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' }
      },
      include: {
        dealer: { select: { name: true } },
        podRecord: true
      }
    });

    const report: Record<string, any> = {};

    orders.forEach(o => {
      const dealerId = o.dealerId || 'direct';
      const dealerName = o.dealer?.name || 'Direct / Walk-in';
      
      if (!report[dealerId]) {
        report[dealerId] = {
          id: dealerId,
          name: dealerName,
          revenue: 0,
          trips: 0,
          podPending: 0,
          avgYield: 0
        };
      }

      report[dealerId].revenue += o.totalAmount;
      report[dealerId].trips += 1;
      if (!o.podRecord) report[dealerId].podPending += 1;
    });

    return Object.values(report).map(d => ({
      ...d,
      avgYield: d.trips > 0 ? d.revenue / d.trips : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Driver Performance Analysis
   */
  static async getDriverAnalytics(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const trips = await prisma.trip.findMany({
      where: {
        companyId,
        departureAt: { gte: startDate, lte: endDate }
      },
      include: {
        driver: {
          include: {
            employee: { select: { name: true } }
          }
        },
        expenses: true
      }
    });

    const report: Record<string, any> = {};

    trips.forEach(t => {
      const driverId = t.driverId;
      const driverName = t.driver?.employee?.name || 'Unknown';

      if (!report[driverId]) {
        report[driverId] = {
          id: driverId,
          name: driverName,
          trips: 0,
          totalAdvance: 0,
          totalExpenses: 0,
          avgExpensePerTrip: 0,
          status: 'Active'
        };
      }

      report[driverId].trips += 1;
      report[driverId].totalAdvance += (t.advanceAmount || 0);
      report[driverId].totalExpenses += t.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    });

    return Object.values(report).map(d => ({
      ...d,
      avgExpensePerTrip: d.trips > 0 ? d.totalExpenses / d.trips : 0
    })).sort((a, b) => b.trips - a.trips);
  }

  /**
   * Category-wise Revenue Breakdown
   */
  static async getCategoryAnalysis(tenantId: string, companyId: string, startDate: Date, endDate: Date) {
    const orders = await prisma.order.groupBy({
      by: ['rateOn'],
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    return orders.map(o => ({
      category: o.rateOn === 'weight' ? 'FTL / Weight Based' : 
                o.rateOn === 'box' ? 'PTL / Box Based' : 'Fixed / Trip Based',
      revenue: o._sum.totalAmount || 0,
      count: o._count.id,
      avgValue: (o._sum.totalAmount || 0) / (o._count.id || 1)
    }));
  }
  /**
   * Global Report Summary for Top Metrics
   */
  static async getReportSummary(tenantId: string, companyId: string) {
    const today = new Date();
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    const [orders, invoices, vehicles, trips] = await Promise.all([
      prisma.order.aggregate({
        where: { companyId, date: { gte: startMonth, lte: endMonth }, status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.freightInvoice.aggregate({
        where: { companyId, status: { notIn: ['paid', 'cancelled'] } },
        _sum: { totalAmount: true }
      }),
      prisma.vehicle.count({ where: { companyId } }),
      prisma.trip.count({ where: { companyId, status: 'in_transit' } })
    ]);

    const revenue = orders._sum.totalAmount || 0;
    const outstanding = invoices._sum.totalAmount || 0;
    const fleetUtilization = vehicles > 0 ? (trips / vehicles) * 100 : 0;

    return {
      revenue,
      outstanding,
      fleetUtilization,
      orderCount: orders._count.id,
      auditHealth: 'A+', // Calculated or fixed based on compliance
      liquidityPool: outstanding + revenue, // Example logic
      ebitdaMargin: 24.5 // Placeholder for complex calc
    };
  }
}

// End of ReportEngine class
