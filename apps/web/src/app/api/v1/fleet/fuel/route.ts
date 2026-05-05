import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    };

    if (vehicleId) whereClause.vehicleId = vehicleId;

    const entries = await prisma.fuelEntry.findMany({
      where: whereClause,
      include: {
        vehicle: { select: { regNo: true, make: true, model: true } }
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // Server-side validation
    if (data.quantity <= 0) return NextResponse.json({ error: 'Quantity must be greater than zero' }, { status: 400 });
    if (data.odometer < 0) return NextResponse.json({ error: 'Odometer cannot be negative' }, { status: 400 });
    if (data.rate < 0) return NextResponse.json({ error: 'Rate cannot be negative' }, { status: 400 });
    if (data.amount < 0) return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 });
    
    // 1. Find Previous Odometer to calculate KMPL
    const prevEntry = await prisma.fuelEntry.findFirst({
      where: {
        vehicleId: data.vehicleId,
        tenantId: session.user.tenantId,
      },
      orderBy: { odometer: 'desc' }
    });

    let prevOdometer = null;
    let distanceKm = null;
    let kmpl = null;
    let isAnomaly = false;
    let anomalyReason = null;

    if (prevEntry) {
      prevOdometer = prevEntry.odometer;
      distanceKm = data.odometer - prevOdometer;
      
      if (distanceKm < 0) {
        return NextResponse.json({ error: 'Odometer cannot be less than previous entry' }, { status: 400 });
      }

      // Calculate KMPL based on distance since last fill and CURRENT quantity 
      if (data.quantity > 0) {
        kmpl = Number((distanceKm / data.quantity).toFixed(2));
      }

      // Anomaly Detection: KMPL below 2.0 or above 8.0 for heavy trucks is highly suspicious
      if (kmpl !== null) {
         if (kmpl < 1.5) {
           isAnomaly = true;
           anomalyReason = 'Extremely low KMPL detected (Possible fuel theft or leak)';
         } else if (kmpl > 8.0) {
           isAnomaly = true;
           anomalyReason = 'Unusually high KMPL detected (Possible incorrect odometer entry)';
         }
      }
      if (distanceKm === 0 && data.quantity > 0) {
         isAnomaly = true;
         anomalyReason = 'Fuel added but odometer has not moved (Idle fuel burn or theft)';
      }
    }

    const entry = await prisma.fuelEntry.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
        vehicleId: data.vehicleId,
        date: new Date(data.date),
        quantity: data.quantity,
        rate: data.rate * 100, // store in paise
        amount: data.amount * 100, // store in paise
        vendor: data.vendor,
        odometer: data.odometer,
        prevOdometer,
        distanceKm,
        kmpl,
        isAnomaly,
        anomalyReason,
      }
    });

    // Update vehicle's current odometer
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { odometer: data.odometer }
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error: any) {
    console.error('Fuel Entry Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
