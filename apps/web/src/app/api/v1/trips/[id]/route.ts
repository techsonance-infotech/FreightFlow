import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { TripEngine } from '@/services/trip-engine';
import { TripUpdateSchema } from '@freightflow/shared';
import { z } from 'zod';

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
            dealer: { select: { id: true, name: true, gstin: true } },
            consignee: { select: { name: true } },
            details: true,
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

    // Validate with TripUpdateSchema — only allow safe fields
    const validatedData = TripUpdateSchema.parse(body);

    // If status is being changed, use the transition engine
    if (validatedData.status) {
      const result = await TripEngine.transitionStatus({
        tripId: id,
        tenantId: user.tenantId,
        companyId: user.companyId,
        newStatus: validatedData.status,
        userId: user.id,
      });
      return NextResponse.json(result);
    }

    // Otherwise, update non-status fields
    const { status: _status, ...updateFields } = validatedData;
    const updateData: any = {};

    if (updateFields.fromLocation !== undefined) updateData.fromLocation = updateFields.fromLocation;
    if (updateFields.toLocation !== undefined) updateData.toLocation = updateFields.toLocation;
    if (updateFields.departureAt !== undefined) updateData.departureAt = updateFields.departureAt ? new Date(updateFields.departureAt) : null;
    if (updateFields.expectedDeliveryAt !== undefined) updateData.expectedDeliveryAt = updateFields.expectedDeliveryAt ? new Date(updateFields.expectedDeliveryAt) : null;
    if (updateFields.actualDeliveryAt !== undefined) updateData.actualDeliveryAt = updateFields.actualDeliveryAt ? new Date(updateFields.actualDeliveryAt) : null;

    const trip = await prisma.trip.update({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      data: updateData,
    });

    return NextResponse.json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[TRIP_PATCH]', error);
    return NextResponse.json({ error: (error as any).message || 'Internal Server Error' }, { status: 500 });
  }
}
