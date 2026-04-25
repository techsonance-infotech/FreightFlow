import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');

    const where: any = {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId!,
    };
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    const jobs = await prisma.maintenanceJob.findMany({
      where,
      include: {
        vehicle: {
          select: { regNo: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    return NextResponse.json(jobs);
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
        jobType: data.jobType,
        description: data.description,
        mechanicAssigned: data.mechanicAssigned,
        odometer: data.odometer,
        estimatedCost: data.estimatedCost,
        startedAt: new Date(data.startedAt),
        status: 'open',
      }
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { id, status, actualCost, completedAt, invoiceUrl, partsUsed } = data;

    const job = await prisma.maintenanceJob.update({
      where: { 
        id,
        companyId: session.user.companyId! 
      },
      data: {
        status,
        actualCost,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        invoiceUrl,
        partsUsed
      }
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
