import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { salaryStructure, user, tenantId, companyId, createdAt, updatedAt, deletedAt, ...employeeData } = body;

    const result = await prisma.$transaction(async (tx) => {
      const existingEmployee = await tx.employee.findUnique({
        where: { id, companyId: session.user.companyId },
        select: { userId: true }
      });

      const employee = await tx.employee.update({
        where: { id, companyId: session.user.companyId },
        data: {
          ...employeeData,
          joiningDate: employeeData.joiningDate ? new Date(employeeData.joiningDate) : null,
          aadharNo: employeeData.aadharNo || null,
          panUrl: employeeData.panUrl || null,
          aadharUrl: employeeData.aadharUrl || null,
          bankIfsc: employeeData.bankIfsc || null,
        }
      });

      // Synchronize with User account if exists
      if (existingEmployee?.userId) {
        await tx.user.update({
          where: { id: existingEmployee.userId },
          data: {
            role: employeeData.role || undefined,
            isActive: employeeData.status === 'active',
          }
        });
      }

      if (salaryStructure) {
        await tx.salaryStructure.upsert({
          where: { employeeId: id },
          create: {
            ...salaryStructure,
            tenantId: session.user.tenantId,
            companyId: session.user.companyId,
            employeeId: employee.id,
            effectiveFrom: salaryStructure.effectiveFrom ? new Date(salaryStructure.effectiveFrom) : new Date()
          },
          update: {
            ...salaryStructure,
            effectiveFrom: salaryStructure.effectiveFrom ? new Date(salaryStructure.effectiveFrom) : new Date()
          }
        });
      }

      return employee;
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.employee.delete({
      where: { id, companyId: session.user.companyId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
