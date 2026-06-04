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

    const [lines, accounts] = await Promise.all([
      prisma.journalLine.groupBy({
        by: ['accountId'],
        where,
        _sum: {
          debit: true,
          credit: true,
        },
      }),
      prisma.chartOfAccount.findMany({
        where: { tenantId, companyId },
        select: { id: true, name: true, code: true, type: true },
      })
    ]);

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
      expiringDocsCount
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
      })
    ]);

    // Get Top Customers for Total Revenue (LR + Pallet)
    const [topOrders, topPallets] = await Promise.all([
      prisma.order.groupBy({
        by: ['dealerId'],
        where: { companyId },
        _sum: { totalAmount: true }
      }),
      prisma.orderPallet.groupBy({
        by: ['dealerId'],
        where: { companyId },
        _sum: { totalAmount: true }
      })
    ]);

    // Get Top Customers specifically for BOX LR
    const topBoxOrders = await prisma.order.groupBy({
      by: ['dealerId'],
      where: { companyId, rateOn: 'box' },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5
    });

    // Merge for Total Share
    const totalShareMap: Record<string, number> = {};
    topOrders.forEach(o => { if(o.dealerId) totalShareMap[o.dealerId] = (totalShareMap[o.dealerId] || 0) + Number(o._sum.totalAmount || 0); });
    topPallets.forEach(p => { if(p.dealerId) totalShareMap[p.dealerId] = (totalShareMap[p.dealerId] || 0) + Number(p._sum.totalAmount || 0); });

    const topTotalIds = Object.entries(totalShareMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
    
    // Fetch all relevant dealer names
    const allDealerIds = Array.from(new Set([
      ...topTotalIds.map(t => t[0]),
      ...topBoxOrders.map(b => b.dealerId).filter(Boolean) as string[],
      ...topPallets.sort((a,b) => Number(b._sum.totalAmount || 0) - Number(a._sum.totalAmount || 0)).slice(0, 5).map(p => p.dealerId).filter(Boolean) as string[]
    ]));

    const dealers = await prisma.dealer.findMany({
      where: { id: { in: allDealerIds } },
      select: { id: true, name: true }
    });

    const formatCustomer = (id: string, amount: number) => ({
      name: dealers.find(d => d.id === id)?.name || 'Direct / Walk-in',
      amount: amount / 100
    });

    // Get Revenue Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueTrendRaw = await prisma.$queryRaw<any[]>`
      SELECT 
        TO_CHAR(date, 'Mon') as month,
        SUM(total_amount) as revenue,
        MIN(date) as sort_date
      FROM (
        SELECT date, total_amount FROM orders WHERE company_id = ${companyId}::uuid AND date >= ${sixMonthsAgo}
        UNION ALL
        SELECT date, total_amount FROM order_pallets WHERE company_id = ${companyId}::uuid AND date >= ${sixMonthsAgo}
      ) combined
      GROUP BY month
      ORDER BY sort_date ASC
    `;

    // Get Settlement Analytics (Pending PODs)
    const pendingSettlements = await prisma.trip.count({
      where: { companyId, status: 'reached' }
    });

    // Get Recent Activity (Last 10 Logs)
    const recentActivity = await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } }
    });

    // Get Route Analytics (Top Destinations by Revenue)
    const [orderRoutes, palletRoutes] = await Promise.all([
      prisma.order.groupBy({
        by: ['toLocation'],
        where: { companyId },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5
      }),
      prisma.orderPallet.groupBy({
        by: ['toLocation'],
        where: { companyId },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5
      })
    ]);

    const routeMap = new Map<string, number>();
    orderRoutes.forEach(r => { if(r.toLocation) routeMap.set(r.toLocation, (routeMap.get(r.toLocation) || 0) + Number(r._sum.totalAmount || 0)); });
    palletRoutes.forEach(r => { if(r.toLocation) routeMap.set(r.toLocation, (routeMap.get(r.toLocation) || 0) + Number(r._sum.totalAmount || 0)); });

    const topRoutes = Array.from(routeMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Get Compliance Detail (Upcoming Expiries)
    const upcomingExpiries = await prisma.vehicleDocument.findMany({
      where: { companyId, expiryDate: { lte: thirtyDaysLater, gte: new Date() } },
      orderBy: { expiryDate: 'asc' },
      take: 5
    });

    const lrsTrend = yesterdayLrs > 0 ? ((todayLrs - yesterdayLrs) / yesterdayLrs) * 100 : 0;
    const todayRevVal = Number(todayRev._sum.totalAmount || 0);
    const yesterdayRevVal = Number(yesterdayRev._sum.totalAmount || 0);
    const revenueTrendPct = yesterdayRevVal > 0 ? ((todayRevVal - yesterdayRevVal) / yesterdayRevVal) * 100 : 0;

    return {
      todayLrs,
      lrsTrend,
      todayRevenue: todayRevVal,
      revenueTrend: revenueTrendPct, // This is the % trend for the KPI card
      revenueTrendSeries: revenueTrendRaw.map(r => ({ // This is for the area chart
        month: r.month,
        revenue: Number(r.revenue || 0) / 100
      })),
      outstandingReceivables: outstanding._sum.totalAmount || 0,
      overdueCount: outstanding._count.id,
      expiringDocsCount,
      customerIntelligence: {
        total: topTotalIds.map(([id, amt]) => formatCustomer(id, amt)),
        box: topBoxOrders.map(b => formatCustomer(b.dealerId!, Number(b._sum.totalAmount || 0))),
        pallet: topPallets.sort((a,b) => Number(b._sum.totalAmount || 0) - Number(a._sum.totalAmount || 0)).slice(0, 5).map(p => formatCustomer(p.dealerId!, Number(p._sum.totalAmount || 0)))
      },
      fleetUtilization: {
        total: totalVehicles,
        onTrip: onTripVehicles,
        maintenance: maintenanceVehicles,
        idle: Math.max(0, totalVehicles - onTripVehicles - maintenanceVehicles)
      },
      routeIntelligence: topRoutes,
      pendingSettlements,
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        user: a.user?.name || 'System',
        action: a.action,
        timestamp: a.createdAt,
        changes: a.changes
      })),
      compliance: upcomingExpiries.map(e => ({
        id: e.id,
        type: e.docType,
        expiryDate: e.expiryDate,
        vehicleNo: 'Vehicle Doc' // Simplified
      }))
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
      // Fetch revenue, fuel entries, and maintenance costs in parallel
      const [revenue, fuel, maintenance] = await Promise.all([
        prisma.order.aggregate({
          where: { vehicleId: v.id, date: { gte: startDate, lte: endDate } },
          _sum: { totalAmount: true }
        }),
        prisma.fuelEntry.aggregate({
          where: { vehicleId: v.id, date: { gte: startDate, lte: endDate } },
          _sum: { amount: true }
        }),
        prisma.maintenanceJob.aggregate({
          where: { vehicleId: v.id, completedAt: { gte: startDate, lte: endDate } },
          _sum: { actualCost: true }
        })
      ]);

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
