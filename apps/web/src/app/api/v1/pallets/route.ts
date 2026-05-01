import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { PalletSchema } from '@freightflow/shared';
import { z } from 'zod';

// GET /api/v1/pallets - List all pallet records
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
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { lrNo: isNaN(parseInt(search)) ? undefined : parseInt(search) },
        { companyName: { contains: search, mode: 'insensitive' } },
        { partyCode: { contains: search, mode: 'insensitive' } },
        { dealer: { name: { contains: search, mode: 'insensitive' } } },
      ].filter(Boolean);
    }

    const [pallets, total] = await Promise.all([
      prisma.orderPallet.findMany({
        where,
        skip,
        take: limit,
        include: {
          dealer: { select: { name: true } },
          vehicle: { select: { regNo: true } },
          palletDetails: true,
          consigneeDetails: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.orderPallet.count({ where }),
    ]);

    return NextResponse.json({
      data: pallets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[PALLETS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/pallets - Create a new pallet record
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    // Validate request body
    const validatedData = PalletSchema.parse(body);

    const pallet = await prisma.orderPallet.create({
      data: {
        tenantId: user.tenantId,
        companyId: user.companyId!,
        lrNo: validatedData.lrNo,
        dealerId: validatedData.dealerId,
        vehicleId: validatedData.vehicleId,
        date: new Date(validatedData.date),
        companyName: validatedData.companyName,
        partyCode: validatedData.partyCode,
        gstPct: validatedData.gstPct,
        status: validatedData.status,
        palletDetails: {
          create: validatedData.palletDetails.map((d) => ({
            companyId: user.companyId!,
            palletDisplayId: d.palletDisplayId,
            boxQty: d.boxQty,
            weight: d.weight,
            consigneeName: d.consigneeName,
            qty: d.qty,
            rate: d.rate,
          })),
        },
        consigneeDetails: {
          create: validatedData.consigneeDetails?.map((d) => ({
            companyId: user.companyId!,
            consigneeName: d.consigneeName,
            qty: d.qty,
            rate: d.rate,
          })),
        },
      },
      include: {
        palletDetails: true,
        consigneeDetails: true,
      },
    });

    return NextResponse.json(pallet, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PALLETS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
