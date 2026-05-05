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
    
    const job = await prisma.maintenanceJob.update({
      where: { 
        id,
        tenantId: session.user.tenantId,
      },
      data: {
        vehicleId: data.vehicleId,
        jobType: data.jobType,
        description: data.description,
        mechanicAssigned: data.mechanicAssigned,
        odometer: data.odometer ? Number(data.odometer) : undefined,
        estimatedCost: data.estimatedCost ? Number(data.estimatedCost) * 100 : undefined,
        actualCost: data.actualCost ? Number(data.actualCost) * 100 : undefined,
        status: data.status,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        completedAt: data.status === 'completed' ? new Date() : undefined,
      }
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Maintenance Job PATCH Error:', error);
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

    await prisma.maintenanceJob.delete({
      where: { 
        id,
        tenantId: session.user.tenantId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Maintenance Job DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
