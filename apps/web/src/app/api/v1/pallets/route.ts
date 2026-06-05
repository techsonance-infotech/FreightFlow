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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const unassigned = searchParams.get('unassigned') === 'true';
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (unassigned) {
      where.tripId = null;
      where.status = { in: ['created', 'active'] };
    } else if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (search) {
      where.OR = [
        { lrNo: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { partyCode: { contains: search, mode: 'insensitive' } },
        { dealer: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { regNo: { contains: search, mode: 'insensitive' } } },
        { palletDetails: { some: { consigneeName: { contains: search, mode: 'insensitive' } } } },
        { consigneeDetails: { some: { consigneeName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [pallets, total] = await Promise.all([
      prisma.orderPallet.findMany({
        where,
        skip,
        take: limit,
        include: {
          dealer: { select: { name: true } },
          consignee: { select: { name: true } },
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

function getUtcNoonDate(dateVal: any): Date {
  if (!dateVal) {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const parts = formatter.format(now).split('/'); // MM/DD/YYYY
      const m = Number(parts[0]);
      const d = Number(parts[1]);
      const y = Number(parts[2]);
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
    } catch (e) {
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0));
    }
  }

  let dObj = new Date(dateVal);
  if (isNaN(dObj.getTime())) {
    dObj = new Date();
  }

  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    const [year, month, day] = dateVal.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.format(dObj).split('/'); // MM/DD/YYYY
    const month = Number(parts[0]);
    const day = Number(parts[1]);
    const year = Number(parts[2]);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  } catch (e) {
    const year = dObj.getUTCFullYear();
    const month = dObj.getUTCMonth();
    const day = dObj.getUTCDate();
    return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
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

    const validatedData = PalletSchema.parse(body);
    const isGst = validatedData.isGstRequired === true;
    const cgstPct = isGst ? validatedData.cgstPct : 0;
    const sgstPct = isGst ? validatedData.sgstPct : 0;
    const igstPct = isGst ? validatedData.igstPct : 0;
    const cgstAmount = isGst ? (body.cgstAmount || 0) : 0;
    const sgstAmount = isGst ? (body.sgstAmount || 0) : 0;
    const igstAmount = isGst ? (body.igstAmount || 0) : 0;

    const pallet = await prisma.orderPallet.create({
      data: {
        tenantId: user.tenantId,
        companyId: user.companyId!,
        lrNo: validatedData.lrNo,
        dealerId: validatedData.dealerId,
        consigneeId: validatedData.consigneeId || null,
        vehicleId: validatedData.vehicleId,
        date: getUtcNoonDate(validatedData.date),
        companyName: validatedData.companyName,
        partyCode: validatedData.partyCode,
        fromLocation: validatedData.fromLocation,
        fromAddress: validatedData.fromAddress,
        toLocation: validatedData.toLocation,
        toAddress: validatedData.toAddress,
        freight: validatedData.freight,
        hamali: validatedData.hamali,
        rateOn: validatedData.rateOn,
        rate: validatedData.rate,
        cgstPct,
        sgstPct,
        igstPct,
        gstType: validatedData.gstType,
        totalWeight: body.totalWeight || 0,
        totalBoxes: body.totalQty || 0,
        subtotal: body.subtotal || 0,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount: body.totalAmount || 0,
        gstPct: validatedData.gstPct,
        type: validatedData.type,
        metadata: validatedData.metadata as any,
        palletDetails: {
          create: (validatedData.palletDetails || []).map((d) => ({
            companyId: user.companyId!,
            palletDisplayId: d.palletDisplayId,
            code: d.code,
            consigneeName: d.consigneeName,
            qty: d.qty,
            boxQty: d.qty,
            weight: d.weight || 0,
            rate: d.rate,
          })),
        },
      },
      include: {
        palletDetails: true,
        consigneeDetails: true,
        dealer: true,
        vehicle: true,
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
