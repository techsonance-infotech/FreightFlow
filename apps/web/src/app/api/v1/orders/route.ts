import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { OrderSchema } from '@freightflow/shared';
import { LREngine } from '@/services/lr-engine';
import { z } from 'zod';

// GET /api/v1/orders - List all orders for the current tenant/company
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { lrNo: { contains: search, mode: 'insensitive' } },
        { gstBillNo: { contains: search, mode: 'insensitive' } },
        { fromLocation: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
        { dealer: { name: { contains: search, mode: 'insensitive' } } },
        { consignee: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { regNo: { contains: search, mode: 'insensitive' } } },
      ].filter(Boolean);
    }

    const unassigned = searchParams.get('unassigned') === 'true';

    if (unassigned) {
      where.trips = { none: {} };
      where.status = 'created';
    } else if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          dealer: { select: { name: true } },
          consignee: { select: { name: true } },
          vehicle: { select: { regNo: true } },
          details: true,
        },
        orderBy: { lrNo: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getUtcNoonDate(dateVal: any): Date {
  if (!dateVal) return new Date();
  const d = new Date(dateVal);
  if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.split('-')[0].length === 4) {
    const [year, month, day] = dateVal.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  }
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
}

// POST /api/v1/orders - Create a new order (LR)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    // Validate request body
    const validatedData = OrderSchema.parse(body);

    // Convert to paise for calculation and storage (Decimal from frontend -> Integer in DB)
    const freightPaise = Math.round(Number(validatedData.freight || 0) * 100);
    const hamaliPaise = Math.round(Number(validatedData.hamali || 0) * 100);
    const ratePaise = Math.round(Number(validatedData.rate || 0) * 100);

    const isGst = validatedData.isGstRequired === true;
    const cgstPct = isGst ? validatedData.cgstPct : 0;
    const sgstPct = isGst ? validatedData.sgstPct : 0;
    const igstPct = isGst ? validatedData.igstPct : 0;

    // Calculate totals server-side for integrity
    const totals = LREngine.calculateOrderTotals({
      details: validatedData.details,
      freight: freightPaise,
      hamali: hamaliPaise,
      cgstPct,
      sgstPct,
      igstPct,
      gstType: validatedData.gstType as any,
      rateOn: validatedData.rateOn as any,
      rate: ratePaise,
    });

    // Get next LR number
    const lrNo = await LREngine.getNextLRNo(user.companyId!, validatedData.date as any);

    // Create order within a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          tenantId: user.tenantId,
          companyId: user.companyId!,
          lrNo,
          gstBillNo: validatedData.gstBillNo,
          companyName: validatedData.companyName,
          dealerId: validatedData.dealerId,
          consigneeId: validatedData.consigneeId,
          ewayBillNo: validatedData.ewayBillNo,
          vehicleId: validatedData.vehicleId,
          date: getUtcNoonDate(validatedData.date),
          fromLocation: validatedData.fromLocation,
          fromAddress: validatedData.fromAddress,
          toLocation: validatedData.toLocation,
          toAddress: validatedData.toAddress,
          freight: freightPaise,
          hamali: hamaliPaise,
          rateOn: validatedData.rateOn,
          rate: ratePaise,
          cgstPct: cgstPct,
          sgstPct: sgstPct,
          igstPct: igstPct,
          gstType: validatedData.gstType,
          totalWeight: totals.totalWeight,
          totalBoxes: totals.totalBoxes,
          subtotal: totals.subtotal,
          cgstAmount: totals.cgstAmount,
          sgstAmount: totals.sgstAmount,
          igstAmount: totals.igstAmount,
          totalAmount: totals.totalAmount,
          status: 'created',
          createdBy: user.id,
          details: {
            create: validatedData.details.map((d) => ({
              companyId: user.companyId!,
              productName: d.productName,
              boxCount: d.boxCount,
              packingType: d.packingType,
              weight: d.weight,
              dcpiNo: d.dcpiNo,
              sortOrder: d.sortOrder,
            })),
          },
        },
        include: {
          details: true,
        },
      });

      // Log initial status
      await tx.lrStatusLog.create({
        data: {
          companyId: user.companyId!,
          orderId: newOrder.id,
          status: 'created',
          notes: 'LR Created',
          updatedBy: user.id,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[ORDERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
