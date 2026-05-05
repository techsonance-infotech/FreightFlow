import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { DriverAdvanceSchema } from '@freightflow/shared';
import { TripEngine } from '@/services/trip-engine';
import { z } from 'zod';

// GET /api/v1/trips/advances - Dedicated advance ledger with filters, search, pagination
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);

    // If stats=true, return aggregated KPI data
    if (searchParams.get('stats') === 'true') {
      const stats = await TripEngine.getAdvanceStats({
        tenantId: user.tenantId,
        companyId: user.companyId,
      });
      return NextResponse.json({ data: stats });
    }

    // If summary=true, return driver-wise summary
    if (searchParams.get('summary') === 'true') {
      const summary = await TripEngine.getDriverAdvanceSummary({
        tenantId: user.tenantId,
        companyId: user.companyId,
      });
      return NextResponse.json({ data: summary });
    }

    // Standard ledger query
    const result = await TripEngine.getAdvanceLedger({
      tenantId: user.tenantId,
      companyId: user.companyId,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('q') || undefined,
      status: searchParams.get('status') || undefined,
      mode: searchParams.get('mode') || undefined,
      driverId: searchParams.get('driverId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ADVANCES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/trips/advances - Create a standalone advance
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    const validatedData = DriverAdvanceSchema.parse(body);

    const advance = await prisma.driverAdvance.create({
      data: {
        tenantId: user.tenantId,
        companyId: user.companyId!,
        driverId: validatedData.driverId,
        tripId: validatedData.tripId || null,
        amount: validatedData.amount,
        mode: validatedData.mode,
        date: new Date(validatedData.date),
        purpose: validatedData.purpose,
        status: 'pending',
      },
      include: {
        driver: {
          include: {
            employee: { select: { name: true, empCode: true } },
          },
        },
        trip: {
          select: { id: true, fromLocation: true, toLocation: true },
        },
      },
    });

    return NextResponse.json(advance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[ADVANCES_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
