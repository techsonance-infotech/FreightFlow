import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { TripEngine } from '@/services/trip-engine';
import { TripExpenseSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;
    const body = await request.json();

    // Validate expense data
    const validatedData = TripExpenseSchema.parse({ ...body, tripId: id });

    const expense = await TripEngine.recordExpense({
      tripId: id,
      tenantId: user.tenantId,
      companyId: user.companyId,
      type: validatedData.type,
      amount: validatedData.amount,
      description: validatedData.description,
      recordedBy: user.id,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[TRIP_EXPENSES_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
