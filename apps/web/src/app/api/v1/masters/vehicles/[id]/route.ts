import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { VehicleSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const vehicle = await prisma.vehicle.findFirst({ 
      where: { id, tenantId: session.user.tenantId, companyId: session.user.companyId, deletedAt: null },
      include: {
        assignedDriver: true,
        vehicleDocuments: true
      }
    });
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const validatedData = VehicleSchema.partial().parse(body);

    const existing = await prisma.vehicle.findFirst({ where: { id, tenantId: session.user.tenantId, companyId: session.user.companyId, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    if (validatedData.regNo && validatedData.regNo !== existing.regNo) {
      const duplicate = await prisma.vehicle.findFirst({
        where: { 
          regNo: validatedData.regNo, 
          companyId: session.user.companyId, 
          deletedAt: null, 
          id: { not: id } 
        } 
      });
      if (duplicate) return NextResponse.json({ error: 'Registration number already in use' }, { status: 400 });
    }

    const { assignedDriverId, ...updateData } = validatedData;
    const newAssignedDriverId = assignedDriverId === 'unassigned' ? null : assignedDriverId;

    const updated = await prisma.vehicle.update({ 
      where: { id }, 
      data: {
        ...updateData,
        assignedDriverId: newAssignedDriverId
      }
    });

    // Handle Driver Assignment History
    if (assignedDriverId !== undefined && existing.assignedDriverId !== newAssignedDriverId) {
      // 1. Close any existing open assignment
      if (existing.assignedDriverId) {
        await prisma.driverAssignment.updateMany({
          where: { vehicleId: id, labourId: existing.assignedDriverId, unassignedAt: null },
          data: { unassignedAt: new Date() }
        });
      }

      // 2. Open new assignment
      if (newAssignedDriverId) {
        await prisma.driverAssignment.create({
          data: {
            tenantId: session.user.tenantId,
            companyId: session.user.companyId!,
            vehicleId: id,
            labourId: newAssignedDriverId,
            assignedBy: session.user.id
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
