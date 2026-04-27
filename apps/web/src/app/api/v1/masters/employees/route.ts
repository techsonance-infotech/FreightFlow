import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employees = await prisma.employee.findMany({
      where: { companyId: session.user.companyId },
      include: { salaryStructure: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ data: employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { salaryStructure, ...employeeData } = body;

    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          ...employeeData,
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          joiningDate: employeeData.joiningDate ? new Date(employeeData.joiningDate) : null
        }
      });

      if (salaryStructure) {
        await tx.salaryStructure.create({
          data: {
            ...salaryStructure,
            tenantId: session.user.tenantId,
            companyId: session.user.companyId,
            employeeId: employee.id,
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
