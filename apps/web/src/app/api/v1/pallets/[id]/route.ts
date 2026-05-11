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

    // Update order pallet
    const pallet = await prisma.orderPallet.update({
      where: { id },
      data: {
        lrNo: validatedData.lrNo,
        dealerId: validatedData.dealerId,
        consigneeId: validatedData.consigneeId,
        vehicleId: validatedData.vehicleId,
        date: new Date(validatedData.date),
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
        cgstPct: validatedData.cgstPct,
        sgstPct: validatedData.sgstPct,
        igstPct: validatedData.igstPct,
        gstType: validatedData.gstType,
        totalWeight: 0,
        totalBoxes: body.totalQty || 0,
        subtotal: body.subtotal || 0,
        cgstAmount: body.cgstAmount || 0,
        sgstAmount: body.sgstAmount || 0,
        igstAmount: body.igstAmount || 0,
        totalAmount: body.totalAmount || 0,
        gstPct: validatedData.gstPct,
        type: validatedData.type,
        status: validatedData.status,
        palletDetails: validatedData.type === 'OUTWARD' ? {
          deleteMany: {},
          create: (validatedData.palletDetails || []).map((d) => ({
            companyId: user.companyId!,
            palletDisplayId: d.palletDisplayId,
            consigneeName: d.consigneeName,
            qty: d.qty,
            rate: d.rate,
          })),
        } : { deleteMany: {} },
        consigneeDetails: validatedData.type === 'RETURN' ? {
          deleteMany: {},
          create: (validatedData.consigneeDetails || []).map((d) => ({
            companyId: user.companyId!,
            consigneeName: d.consigneeName,
            qty: d.qty,
            rate: d.rate,
          })),
        } : { deleteMany: {} },
      },
      include: {
        palletDetails: true,
        consigneeDetails: true,
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
