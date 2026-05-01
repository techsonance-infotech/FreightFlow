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

    const jobs = await prisma.maintenanceJob.findMany({
      where: whereClause,
      include: {
        vehicle: { select: { regNo: true, make: true, model: true } }
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    const job = await prisma.maintenanceJob.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
        vehicleId: data.vehicleId,
        jobType: data.jobType, // 'scheduled' | 'breakdown'
        description: data.description,
        mechanicAssigned: data.mechanicAssigned || null,
        odometer: Number(data.odometer),
        estimatedCost: data.estimatedCost ? Number(data.estimatedCost) * 100 : null,
        actualCost: data.actualCost ? Number(data.actualCost) * 100 : null,
        startedAt: new Date(data.startedAt),
        status: data.status || 'open',
      }
    });

    // Also update vehicle's current odometer and set status if breakdown
    const vehicleUpdate: any = { odometer: Number(data.odometer) };
    if (data.jobType === 'breakdown' && data.status !== 'completed') {
       vehicleUpdate.status = 'maintenance';
    }

    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: vehicleUpdate
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    console.error('Maintenance Entry Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
