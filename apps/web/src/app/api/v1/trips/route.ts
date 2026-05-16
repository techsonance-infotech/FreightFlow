import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { TripSchema } from '@freightflow/shared';
import { TripEngine } from '@/services/trip-engine';
import { z } from 'zod';

// GET /api/v1/trips - List all trips with search, filters, and optional KPI stats
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);

    // If stats=true, return aggregated KPI data only
    if (searchParams.get('stats') === 'true') {
      const stats = await TripEngine.getKpiStats({
        tenantId: user.tenantId,
        companyId: user.companyId,
      });
      return NextResponse.json({ data: stats });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('q');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Search across trip ID, vehicle regNo, driver name, from/to locations
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { fromLocation: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
        { vehicle: { regNo: { contains: search, mode: 'insensitive' } } },
        { driver: { employee: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          vehicle: { select: { regNo: true, type: true } },
          driver: {
            include: {
              employee: { select: { name: true, empCode: true } },
            },
          },
          _count: { select: { orders: true, pallets: true } },
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
          advanceAmount: Math.round(Number(validatedData.advanceAmount || 0) * 100),
          status: 'created',
          createdBy: user.id,
          orders: {
            connect: validatedData.orderIds.map((id) => ({ id })),
          },
          pallets: {
            connect: (validatedData.palletIds || []).map((id) => ({ id })),
          },
        },
      });

      // Record initial driver advance if provided
      const advanceAmountPaise = Math.round(Number(validatedData.advanceAmount || 0) * 100);
      if (advanceAmountPaise > 0) {
        await tx.driverAdvance.create({
          data: {
            tenantId: user.tenantId,
            companyId: user.companyId!,
            driverId: validatedData.driverId,
            tripId: newTrip.id,
            amount: advanceAmountPaise,
            mode: 'cash', // Default to cash for initial trip advance
            date: new Date(),
            purpose: `Initial advance for trip ${newTrip.id}`,
          },
        });
      }

      // Sync cargo statuses to 'loaded'
      if (validatedData.orderIds.length > 0) {
        await tx.order.updateMany({
          where: { id: { in: validatedData.orderIds } },
          data: { status: 'loaded' }
        });
        // Log status for LRs
        for (const orderId of validatedData.orderIds) {
          await tx.lrStatusLog.create({
            data: {
              companyId: user.companyId!,
              orderId,
              status: 'loaded',
              notes: `Trip ${newTrip.id} dispatched`,
              updatedBy: user.id,
            }
          });
        }
      }
      if (validatedData.palletIds.length > 0) {
        await tx.orderPallet.updateMany({
          where: { id: { in: validatedData.palletIds } },
          data: { status: 'loaded' }
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
