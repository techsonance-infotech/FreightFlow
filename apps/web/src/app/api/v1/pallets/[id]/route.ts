import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { PalletSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pallet = await prisma.orderPallet.findUnique({
      where: { id },
      include: {
        palletDetails: true,
        consigneeDetails: true,
        dealer: true,
        vehicle: true,
      },
    });

    if (!pallet || pallet.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(pallet);
  } catch (error) {
    console.error('[PALLET_GET]', error);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify ownership before mutating — prevents cross-tenant data access
    const existing = await prisma.orderPallet.findUnique({
      where: { id },
      select: { tenantId: true },
    });
    if (!existing || existing.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update order pallet
    const pallet = await prisma.orderPallet.update({
      where: { id },
      data: {
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
        metadata: validatedData.metadata as any,
        palletDetails: {
          deleteMany: {},
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
      }
    });

    return NextResponse.json(pallet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PALLET_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership before mutating — prevents cross-tenant data access
    const existing = await prisma.orderPallet.findUnique({
      where: { id },
      select: { tenantId: true },
    });
    if (!existing || existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.orderPallet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PALLET_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
