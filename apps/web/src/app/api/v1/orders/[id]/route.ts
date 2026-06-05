import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

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

    const order = await prisma.order.findUnique({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      include: {
        dealer: true,
        consignee: true,
        vehicle: true,
        details: true,
        statusLog: true,
        podRecord: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_GET_BY_ID]', error);
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

    const { OrderSchema } = await import('@freightflow/shared');
    const { LREngine } = await import('@/services/lr-engine');

    // Validate request body
    const validatedData = OrderSchema.parse(body);

    // Convert to paise for calculation and storage
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

    const order = await prisma.$transaction(async (tx) => {
      // Delete existing details to replace with new ones
      await tx.orderDetail.deleteMany({
        where: { orderId: id }
      });

      return await tx.order.update({
        where: {
          id,
          tenantId: user.tenantId,
          companyId: user.companyId!,
        },
        data: {
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
          status: validatedData.status,
          details: {
            create: validatedData.details.map((d: any, idx: number) => ({
              companyId: user.companyId!,
              productName: d.productName,
              boxCount: d.boxCount,
              packingType: d.packingType,
              weight: d.weight,
              dcpiNo: d.dcpiNo,
              sortOrder: idx
            }))
          }
        },
      });
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.order.update({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('[ORDER_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
