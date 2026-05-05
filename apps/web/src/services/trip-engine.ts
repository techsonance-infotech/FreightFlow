import { prisma } from '@freightflow/db';
import { VALID_STATUS_TRANSITIONS } from '@freightflow/shared';

export class TripEngine {
  /**
   * Calculates the P&L for a trip.
   * Revenue = Sum of freight from all assigned LRs.
   * Costs = Sum of all trip expenses.
   */
  static async calculateTripPnL(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        orders: {
          select: { totalAmount: true, subtotal: true },
        },
        expenses: {
          select: { amount: true },
        },
      },
    });

    if (!trip) throw new Error('Trip not found');

    const totalRevenue = trip.orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netContribution = totalRevenue - totalExpenses;
    const marginPct = totalRevenue > 0 ? (netContribution / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netContribution,
      marginPct: parseFloat(marginPct.toFixed(2)),
    };
  }

  /**
   * Records a new expense for a trip and updates the trip's status if needed.
   */
  static async recordExpense(params: {
    tripId: string;
    tenantId: string;
    companyId: string;
    type: string;
    amount: number;
    description?: string;
    recordedBy: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const expense = await tx.tripExpense.create({
        data: {
          tenantId: params.tenantId,
          companyId: params.companyId,
          tripId: params.tripId,
          type: params.type,
          amount: params.amount,
          description: params.description,
          recordedBy: params.recordedBy,
        },
      });

      // Optionally update trip status to 'in_transit' if it was 'loaded'
      const trip = await tx.trip.findUnique({ where: { id: params.tripId } });
      if (trip?.status === 'loaded') {
        await tx.trip.update({
          where: { id: params.tripId },
          data: { status: 'in_transit' },
        });
      }

      return expense;
    });
  }

  /**
   * Settles a trip by calculating the final balance and updating status.
   */
  static async settleTrip(params: {
    tripId: string;
    tenantId: string;
    companyId: string;
    settledBy: string;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: params.tripId },
        include: { expenses: true },
      });

      if (!trip) throw new Error('Trip not found');
      if (trip.status === 'settled') throw new Error('Trip already settled');

      const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
      const balance = trip.advanceAmount - totalExpenses;
      const settlementType = balance >= 0 ? 'refund' : 'additional_payment';

      const settlement = await tx.tripSettlement.create({
        data: {
          tenantId: params.tenantId,
          companyId: params.companyId,
          tripId: params.tripId,
          advanceAmount: trip.advanceAmount,
          totalExpenses,
          balance,
          settlementType,
          settledBy: params.settledBy,
        },
      });

      await tx.trip.update({
        where: { id: params.tripId },
        data: { status: 'settled' },
      });

      return settlement;
    });
  }

  // ============================================
  // NEW: Status Transition Engine
  // ============================================

  /**
   * Validates and executes a status transition for a trip.
   * Enforces the state machine: created → loaded → in_transit → delivered → settled
   */
  static async transitionStatus(params: {
    tripId: string;
    tenantId: string;
    companyId: string;
    newStatus: string;
    userId: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: {
          id: params.tripId,
          tenantId: params.tenantId,
          companyId: params.companyId,
        },
      });

      if (!trip) throw new Error('Trip not found');

      const allowedNextStates = VALID_STATUS_TRANSITIONS[trip.status] || [];
      if (!allowedNextStates.includes(params.newStatus)) {
        throw new Error(
          `Invalid status transition: ${trip.status} → ${params.newStatus}. Allowed: ${allowedNextStates.join(', ') || 'none'}`
        );
      }

      // Build update data
      const updateData: any = { status: params.newStatus };

      // Auto-set timestamps based on transition
      if (params.newStatus === 'in_transit' && !trip.departureAt) {
        updateData.departureAt = new Date();
      }
      if (params.newStatus === 'delivered') {
        updateData.actualDeliveryAt = new Date();
      }

      const updated = await tx.trip.update({
        where: { id: params.tripId },
        data: updateData,
      });

      return updated;
    });
  }

  // ============================================
  // NEW: KPI Statistics
  // ============================================

  /**
   * Returns aggregated KPI stats for the trips dashboard.
   */
  static async getKpiStats(params: {
    tenantId: string;
    companyId: string;
  }) {
    const baseWhere = {
      tenantId: params.tenantId,
      companyId: params.companyId,
      deletedAt: null,
    };

    // Get start of current month for MTD calculations
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      statusCounts,
      mtdDelivered,
      totalAdvancesMtd,
      outstandingAdvances,
    ] = await Promise.all([
      // Count by active statuses
      prisma.trip.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
      }),
      // MTD delivered count
      prisma.trip.count({
        where: {
          ...baseWhere,
          status: 'delivered',
          actualDeliveryAt: { gte: mtdStart },
        },
      }),
      // MTD total advance amount
      prisma.driverAdvance.aggregate({
        where: {
          tenantId: params.tenantId,
          companyId: params.companyId,
          date: { gte: mtdStart },
        },
        _sum: { amount: true },
      }),
      // Outstanding advances (not fully recovered)
      prisma.driverAdvance.aggregate({
        where: {
          tenantId: params.tenantId,
          companyId: params.companyId,
          status: { in: ['pending', 'partially_recovered'] },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Parse status counts
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    const activeCount =
      (statusMap['created'] || 0) +
      (statusMap['loaded'] || 0) +
      (statusMap['in_transit'] || 0);

    const inTransitCount = statusMap['in_transit'] || 0;
    const settledMtd = statusMap['settled'] || 0;

    return {
      activeTrips: activeCount,
      inTransit: inTransitCount,
      deliveredMtd: mtdDelivered,
      settledMtd,
      totalAdvancesMtd: totalAdvancesMtd._sum.amount || 0,
      outstandingExposure: outstandingAdvances._sum.amount || 0,
      outstandingCount: outstandingAdvances._count.id || 0,
      statusBreakdown: statusMap,
    };
  }

  // ============================================
  // NEW: Advance Ledger
  // ============================================

  /**
   * Fetches the advance ledger with filters, search, and pagination.
   */
  static async getAdvanceLedger(params: {
    tenantId: string;
    companyId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    mode?: string;
    driverId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: params.tenantId,
      companyId: params.companyId,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.mode) {
      where.mode = params.mode;
    }

    if (params.driverId) {
      where.driverId = params.driverId;
    }

    if (params.dateFrom || params.dateTo) {
      where.date = {};
      if (params.dateFrom) where.date.gte = new Date(params.dateFrom);
      if (params.dateTo) where.date.lte = new Date(params.dateTo);
    }

    if (params.search) {
      where.OR = [
        { purpose: { contains: params.search, mode: 'insensitive' } },
        { driver: { employee: { name: { contains: params.search, mode: 'insensitive' } } } },
      ];
    }

    const [advances, total] = await Promise.all([
      prisma.driverAdvance.findMany({
        where,
        skip,
        take: limit,
        include: {
          driver: {
            include: {
              employee: { select: { name: true, empCode: true } },
            },
          },
          trip: {
            select: {
              id: true,
              fromLocation: true,
              toLocation: true,
              status: true,
              vehicle: { select: { regNo: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.driverAdvance.count({ where }),
    ]);

    return {
      data: advances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Returns aggregated advance KPI stats.
   */
  static async getAdvanceStats(params: {
    tenantId: string;
    companyId: string;
  }) {
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [disbursedMtd, totalRecovered, outstanding, pendingCount] =
      await Promise.all([
        prisma.driverAdvance.aggregate({
          where: {
            tenantId: params.tenantId,
            companyId: params.companyId,
            date: { gte: mtdStart },
          },
          _sum: { amount: true },
        }),
        prisma.driverAdvance.aggregate({
          where: {
            tenantId: params.tenantId,
            companyId: params.companyId,
          },
          _sum: { recoveredAmount: true },
        }),
        // Outstanding = sum of (amount - recoveredAmount) for pending/partial
        prisma.$queryRaw<{ total: bigint }[]>`
          SELECT COALESCE(SUM(amount - recovered_amount), 0) as total
          FROM driver_advances
          WHERE tenant_id = ${params.tenantId}::uuid
            AND company_id = ${params.companyId}::uuid
            AND status IN ('pending', 'partially_recovered')
        `,
        prisma.driverAdvance.count({
          where: {
            tenantId: params.tenantId,
            companyId: params.companyId,
            status: { in: ['pending', 'partially_recovered'] },
          },
        }),
      ]);

    return {
      disbursedMtd: disbursedMtd._sum.amount || 0,
      totalRecovered: totalRecovered._sum.recoveredAmount || 0,
      outstandingExposure: Number(outstanding[0]?.total || 0),
      pendingRecoveryCount: pendingCount,
    };
  }

  /**
   * Returns driver-wise advance summary for the summary view.
   */
  static async getDriverAdvanceSummary(params: {
    tenantId: string;
    companyId: string;
  }) {
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        da.driver_id as "driverId",
        e.name as "driverName",
        e.emp_code as "empCode",
        COUNT(da.id) as "totalAdvances",
        COALESCE(SUM(da.amount), 0) as "totalGiven",
        COALESCE(SUM(da.recovered_amount), 0) as "totalRecovered",
        COALESCE(SUM(da.amount - da.recovered_amount), 0) as "netOutstanding",
        MAX(da.date) as "lastAdvanceDate"
      FROM driver_advances da
      JOIN drivers d ON d.id = da.driver_id
      JOIN employees e ON e.id = d.employee_id
      WHERE da.tenant_id = ${params.tenantId}::uuid
        AND da.company_id = ${params.companyId}::uuid
      GROUP BY da.driver_id, e.name, e.emp_code
      HAVING SUM(da.amount - da.recovered_amount) > 0
      ORDER BY SUM(da.amount - da.recovered_amount) DESC
    `;

    return results.map((r) => ({
      ...r,
      totalAdvances: Number(r.totalAdvances),
      totalGiven: Number(r.totalGiven),
      totalRecovered: Number(r.totalRecovered),
      netOutstanding: Number(r.netOutstanding),
    }));
  }

  // ============================================
  // NEW: Advance Recovery
  // ============================================

  /**
   * Records a recovery against a driver advance.
   */
  static async recoverAdvance(params: {
    advanceId: string;
    tenantId: string;
    companyId: string;
    recoveryAmount: number;
    mode: string;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const advance = await tx.driverAdvance.findUnique({
        where: { id: params.advanceId },
      });

      if (!advance) throw new Error('Advance not found');
      if (advance.tenantId !== params.tenantId) throw new Error('Unauthorized');
      if (advance.status === 'recovered') throw new Error('Advance already fully recovered');

      const currentOutstanding = advance.amount - advance.recoveredAmount;
      if (params.recoveryAmount > currentOutstanding) {
        throw new Error(
          `Recovery amount (${params.recoveryAmount}) exceeds outstanding balance (${currentOutstanding})`
        );
      }

      const newRecoveredAmount = advance.recoveredAmount + params.recoveryAmount;
      const newStatus =
        newRecoveredAmount >= advance.amount ? 'recovered' : 'partially_recovered';

      const updated = await tx.driverAdvance.update({
        where: { id: params.advanceId },
        data: {
          recoveredAmount: newRecoveredAmount,
          status: newStatus,
        },
      });

      return updated;
    });
  }
}
