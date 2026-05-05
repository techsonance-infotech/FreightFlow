import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { id, expenseId } = await params;

    // Verify trip belongs to tenant and is not settled
    const trip = await prisma.trip.findUnique({
      where: { id, tenantId: user.tenantId, companyId: user.companyId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.status === 'settled') {
      return NextResponse.json({ error: 'Cannot delete expenses from a settled trip' }, { status: 400 });
    }

    // Verify expense belongs to the trip
    const expense = await prisma.tripExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense || expense.tripId !== id) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await prisma.tripExpense.delete({ where: { id: expenseId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[TRIP_EXPENSE_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
