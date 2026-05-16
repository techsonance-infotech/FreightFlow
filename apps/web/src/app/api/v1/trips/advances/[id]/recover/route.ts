import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { TripEngine } from '@/services/trip-engine';
import { AdvanceRecoverySchema } from '@freightflow/shared';
import { z } from 'zod';

// POST /api/v1/trips/advances/[id]/recover - Record recovery against an advance
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

    const validatedData = AdvanceRecoverySchema.parse(body);

    const result = await TripEngine.recoverAdvance({
      advanceId: id,
      tenantId: user.tenantId,
      companyId: user.companyId!,
      recoveryAmount: Math.round(Number(validatedData.recoveryAmount || 0) * 100),
      mode: validatedData.mode,
      notes: validatedData.notes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[ADVANCE_RECOVER]', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
