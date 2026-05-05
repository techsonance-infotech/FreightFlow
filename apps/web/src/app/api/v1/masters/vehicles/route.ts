import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { VehicleSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { regNo: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({ 
        where, 
        skip, 
        take: limit, 
        include: {
          assignedDriver: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          vehicleDocuments: {
            select: {
              id: true,
              docType: true,
              expiryDate: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' } 
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({ data: vehicles, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { user } = session;
    const body = await request.json();
    const validatedData = VehicleSchema.parse(body);

    // Global unique check for Reg No
    const existing = await prisma.vehicle.findFirst({
      where: { regNo: validatedData.regNo, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json({ error: 'Vehicle with this registration number already exists' }, { status: 400 });
    }

    const { assignedDriverId, ...vehicleData } = validatedData;
    const initialDriverId = assignedDriverId === 'unassigned' ? null : assignedDriverId;

    const vehicle = await prisma.vehicle.create({
      data: {
        ...vehicleData,
        assignedDriverId: initialDriverId,
        tenantId: user.tenantId,
        companyId: user.companyId!,
      },
    });

    if (initialDriverId) {
      await prisma.driverAssignment.create({
        data: {
          tenantId: user.tenantId,
          companyId: user.companyId!,
          vehicleId: vehicle.id,
          labourId: initialDriverId,
          assignedBy: user.id
        }
      });
    }

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
