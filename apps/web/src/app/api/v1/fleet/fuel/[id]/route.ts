import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // Server-side validation
    if (data.quantity <= 0) return NextResponse.json({ error: 'Quantity must be greater than zero' }, { status: 400 });
    if (data.odometer < 0) return NextResponse.json({ error: 'Odometer cannot be negative' }, { status: 400 });
    
    // Get existing to find prevOdometer
    const existing = await prisma.fuelEntry.findUnique({
      where: { id, tenantId: session.user.tenantId }
    });

    if (!existing) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    let distanceKm = null;
    let kmpl = null;
    let isAnomaly = false;
    let anomalyReason = null;

    if (existing.prevOdometer !== null) {
      distanceKm = data.odometer - existing.prevOdometer;
      if (distanceKm < 0) return NextResponse.json({ error: 'Odometer cannot be less than previous entry' }, { status: 400 });
      
      if (data.quantity > 0) {
        kmpl = Number((distanceKm / data.quantity).toFixed(2));
      }

      if (kmpl !== null) {
        if (kmpl < 1.5) {
          isAnomaly = true;
          anomalyReason = 'Extremely low KMPL detected (Possible fuel theft or leak)';
        } else if (kmpl > 8.0) {
          isAnomaly = true;
          anomalyReason = 'Unusually high KMPL detected (Possible incorrect odometer entry)';
        }
      }
    }

    const entry = await prisma.fuelEntry.update({
      where: { id },
      data: {
        date: new Date(data.date),
        quantity: data.quantity,
        rate: data.rate * 100,
        amount: data.amount * 100,
        vendor: data.vendor,
        odometer: data.odometer,
        distanceKm,
        kmpl,
        isAnomaly,
        anomalyReason,
      }
    });

    // If this was the latest entry, update vehicle odometer
    const latest = await prisma.fuelEntry.findFirst({
      where: { vehicleId: entry.vehicleId, tenantId: session.user.tenantId },
      orderBy: { odometer: 'desc' }
    });

    if (latest && latest.id === id) {
      await prisma.vehicle.update({
        where: { id: entry.vehicleId },
        data: { odometer: data.odometer }
      });
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error: any) {
    console.error('Fuel Entry PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.fuelEntry.delete({
      where: { id, tenantId: session.user.tenantId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fuel Entry DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
