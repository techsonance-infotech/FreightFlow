import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { TripSchema } from '@freightflow/shared';
import { z } from 'zod';

// GET /api/v1/trips - List all trips
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          vehicle: { select: { regNo: true } },
          driver: { include: { employee: { select: { name: true } } } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.count({ where }),
    ]);

    return NextResponse.json({
      data: trips,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TRIPS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/trips - Create a new trip
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    // Validate request body
    const validatedData = TripSchema.parse(body);

    const trip = await prisma.$transaction(async (tx) => {
      // Create the trip
      const newTrip = await tx.trip.create({
        data: {
          tenantId: user.tenantId,
          companyId: user.companyId!,
          vehicleId: validatedData.vehicleId,
          driverId: validatedData.driverId,
          coDriverId: validatedData.coDriverId,
          fromLocation: validatedData.fromLocation,
          toLocation: validatedData.toLocation,
          departureAt: validatedData.departureAt ? new Date(validatedData.departureAt) : null,
          expectedDeliveryAt: validatedData.expectedDeliveryAt ? new Date(validatedData.expectedDeliveryAt) : null,
          advanceAmount: validatedData.advanceAmount,
          status: 'created',
          createdBy: user.id,
          orders: {
            connect: validatedData.orderIds.map((id) => ({ id })),
          },
        },
      });

      // Record initial driver advance if provided
      if (validatedData.advanceAmount > 0) {
        await tx.driverAdvance.create({
          data: {
            tenantId: user.tenantId,
            companyId: user.companyId!,
            driverId: validatedData.driverId,
            tripId: newTrip.id,
            amount: validatedData.advanceAmount,
            mode: 'cash', // Default to cash for initial trip advance
            date: new Date(),
            purpose: `Initial advance for trip ${newTrip.id}`,
          },
        });
      }

      return newTrip;
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[TRIPS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
