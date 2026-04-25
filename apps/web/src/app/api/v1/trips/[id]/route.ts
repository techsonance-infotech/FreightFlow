import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { TripEngine } from '@/services/trip-engine';

export async function GET(
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

    const trip = await prisma.trip.findUnique({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      include: {
        vehicle: true,
        driver: { include: { employee: { select: { name: true, empCode: true } } } },
        orders: {
          include: {
            dealer: { select: { name: true } },
            consignee: { select: { name: true } },
          },
        },
        expenses: {
          orderBy: { recordedAt: 'desc' },
        },
        advances: true,
        settlement: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Include P&L metrics in the response
    const pnl = await TripEngine.calculateTripPnL(id).catch(() => null);

    return NextResponse.json({ ...trip, pnl });
  } catch (error) {
    console.error('[TRIP_GET_BY_ID]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
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

    const trip = await prisma.trip.update({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      data: body,
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('[TRIP_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
