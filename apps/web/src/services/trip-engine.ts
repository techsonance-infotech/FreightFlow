import { prisma } from '@freightflow/db';
import { TripStatusSchema } from '@freightflow/shared';

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
}
