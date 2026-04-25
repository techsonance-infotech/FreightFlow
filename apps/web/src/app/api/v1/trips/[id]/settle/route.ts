import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { TripEngine } from '@/services/trip-engine';

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

    const settlement = await TripEngine.settleTrip({
      tripId: id,
      tenantId: user.tenantId,
      companyId: user.companyId,
      settledBy: user.id,
      notes: body.notes,
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error: any) {
    console.error('[TRIP_SETTLE_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
