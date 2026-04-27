import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { FleetService } from '@/services/fleet-service';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const report = await FleetService.getFuelReport(session.user.tenantId, session.user.companyId!);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { vehicleId, date, quantity, rate, amount, odometer, vendor } = data;

    // 1. Find previous fuel entry to calculate KMPL
    const lastEntry = await prisma.fuelEntry.findFirst({
      where: { vehicleId, companyId: session.user.companyId! },
      orderBy: { odometer: 'desc' }
    });

    const prevOdometer = lastEntry?.odometer || 0;
    const distanceKm = odometer - prevOdometer;
    const kmpl = FleetService.calculateKMPL(odometer, prevOdometer, quantity);

    // 2. Get vehicle average KMPL for anomaly detection
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { odometer: true }
    });

    const avgKmplResult = await prisma.fuelEntry.aggregate({
      where: { vehicleId },
      _avg: { kmpl: true }
    });
    
    const vehicleAvgKmpl = Number(avgKmplResult._avg.kmpl || 0);
    const { isAnomaly, reason } = FleetService.detectAnomaly(kmpl, vehicleAvgKmpl);

    // 3. Create entry
    const entry = await prisma.fuelEntry.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
        vehicleId,
        date: new Date(date),
        quantity,
        rate,
        amount,
        odometer,
        prevOdometer,
        distanceKm,
        kmpl,
        vehicleAvgKmpl,
        isAnomaly,
        anomalyReason: reason,
        vendor
      }
    });

    // 4. Update vehicle odometer if this is the latest reading
    if (vehicle && odometer > vehicle.odometer) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { odometer }
      });
    }

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('[Fuel API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
